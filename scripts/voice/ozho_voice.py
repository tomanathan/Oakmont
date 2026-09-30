"""Ozho's voice: best-of-N generation with automated listening checks.

For every spoken line in the lesson videos (scripts/export-lesson-video-lines.ts):

  1. Split into sentences. Each sentence is synthesized on its own so its
     ending intonation is clean (a statement settles, a yes/no question
     rises), and the pause between sentences is set exactly.
  2. Make several takes of each sentence (Chatterbox, reference voice, no
     watermark) and score every take with three "listeners":
       - enunciation: faster-whisper transcribes the take; every expected
         word must come back, each heard with high confidence;
       - cadence: word timings give the pause at every comma, colon,
         semicolon and dash, compared with a target beat for that mark;
         speaking rate must sit in a natural range;
       - tonality: a Praat pitch track checks the sentence melody: yes/no
         questions rise at the end, statements settle, no pitch jumps;
     plus clean-audio checks (no clipping, no clicks).
  3. Keep the best take, stretch any punctuation pause that came out short
     (silence is inserted in the quietest part of the existing gap), and
     assemble the line with fixed sentence pauses.
  4. Re-listen to the finished line and write a report (JSON + a pitch plot
     per line) for the reviewer agents and a human ear.

Run with the voice env:
  ~/oakmont-voice/env/bin/python scripts/voice/ozho_voice.py \
     --lines /tmp/lesson-video-lines.json --ref ~/oakmont-voice/refs/am_michael.wav \
     --out /tmp/ozho-voice/michael [--only <slug>] [--takes 4] [--publish]

--publish writes public/lesson-audio/<slug>.mp3 and lib/lessonVideos/audio.json.
"""
import argparse, json, os, re, subprocess, tempfile, warnings

import numpy as np
import soundfile as sf

warnings.filterwarnings("ignore")
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

# Timing of a video (must match components/lessonVideo/timeline.ts's intro).
INTRO = 1.7
LEAD, PAD, RECAP_TAIL = 0.15, 0.5, 1.2

# Pause targets, in seconds, for the gap a punctuation mark should leave.
PAUSE_MIN = {",": 0.17, ";": 0.30, ":": 0.34, "—": 0.28, "-": 0.24}
PAUSE_MAX = {",": 0.45, ";": 0.60, ":": 0.65, "—": 0.60, "-": 0.55}
SENTENCE_PAUSE = {".": 0.40, "?": 0.48, "!": 0.40}

AUX = r"^(do|does|did|is|are|was|were|can|could|will|would|should|has|have|had|am|may|might|must|shall)\b"


# ---------- text ----------

def sentences(text):
    """Split a line into sentences, keeping their end marks."""
    parts = re.findall(r"[^.?!]+[.?!]+|[^.?!]+$", text.strip())
    return [p.strip() for p in parts if p.strip()]


def words_of(text):
    return re.findall(r"[a-z0-9']+", text.lower().replace("’", "'"))


def punct_slots(sentence):
    """(word index after which the mark falls, mark) for in-sentence marks."""
    slots = []
    count = 0
    for tok in re.findall(r"[A-Za-z0-9'’]+|[,;:—]|\s-\s", sentence):
        if re.match(r"[A-Za-z0-9'’]", tok):
            count += 1
        else:
            mark = tok.strip()
            if count > 0:
                slots.append((count - 1, mark))
    return slots


def expects_rise(sentence):
    """Yes/no questions rise. Wh-questions and either/or questions fall."""
    s = sentence.strip()
    if not s.endswith("?") or re.match(AUX, s.lower()) is None:
        return False
    return not re.search(r",?\s+or\s+[^,]+\?$", s.lower())


def syllables(word):
    groups = re.findall(r"[aeiouy]+", word.lower())
    n = len(groups) - (1 if word.lower().endswith("e") and len(groups) > 1 else 0)
    return max(1, n)


# ---------- engines ----------

class Voice:
    def __init__(self, ref, exaggeration, cfg, temperature):
        import torch
        from chatterbox.tts import ChatterboxTTS

        self.torch = torch
        dev = "mps" if torch.backends.mps.is_available() else "cpu"
        self.m = ChatterboxTTS.from_pretrained(device=dev)

        class NoWatermark:  # the Perth watermark is audible as static here
            def apply_watermark(self, wav, sample_rate):
                return wav

        self.m.watermarker = NoWatermark()
        self.sr = self.m.sr
        # Analyze the reference voice once, not on every take.
        self.m.prepare_conditionals(ref, exaggeration=exaggeration)
        self.kw = dict(exaggeration=exaggeration, cfg_weight=cfg, temperature=temperature)

    def take(self, text, seed):
        self.torch.manual_seed(seed)
        w = self.m.generate(text, **self.kw)
        return w.squeeze().cpu().numpy().astype(np.float32)


class Ear:
    def __init__(self, model="small.en"):
        from faster_whisper import WhisperModel

        self.m = WhisperModel(model, device="cpu", compute_type="int8")

    def hear(self, audio, sr):
        with tempfile.NamedTemporaryFile(suffix=".wav") as f:
            sf.write(f.name, audio, sr)
            segs, _ = self.m.transcribe(f.name, word_timestamps=True, beam_size=5, language="en", vad_filter=False)
            out = []
            for s in segs:
                for w in s.words or []:
                    out.append({"w": w.word.strip(), "start": w.start, "end": w.end, "p": w.probability})
            return out


# ---------- listening checks ----------

def align(expected, heard):
    """Greedy alignment of expected words to heard words (for timings)."""
    hw = [re.sub(r"[^a-z0-9']", "", h["w"].lower()) for h in heard]
    idx, j = [], 0
    for e in expected:
        k = next((k for k in range(j, min(j + 4, len(hw))) if hw[k] == e or (len(e) > 3 and hw[k][:4] == e[:4])), None)
        idx.append(k)
        if k is not None:
            j = k + 1
    return idx


def wer(expected, heard_words):
    a, b = expected, heard_words
    d = np.zeros((len(a) + 1, len(b) + 1), dtype=int)
    d[:, 0] = range(len(a) + 1)
    d[0, :] = range(len(b) + 1)
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            d[i, j] = min(d[i - 1, j] + 1, d[i, j - 1] + 1, d[i - 1, j - 1] + (0 if a[i - 1] == b[j - 1] else 1))
    return d[len(a), len(b)] / max(1, len(a))


def pitch_track(audio, sr):
    import parselmouth

    snd = parselmouth.Sound(audio.astype(np.float64), sampling_frequency=sr)
    p = snd.to_pitch(time_step=0.01, pitch_floor=65, pitch_ceiling=400)
    f0 = p.selected_array["frequency"]
    t = p.xs()
    return t, f0


def tonality(audio, sr, sentence):
    t, f0 = pitch_track(audio, sr)
    v = f0[f0 > 0]
    notes = []
    score = 1.0
    if len(v) < 10:
        return 0.3, ["too little voiced audio"], {}
    semis = 12 * np.log2(v / np.median(v))
    jumps = np.abs(np.diff(semis))
    spikes = int((jumps > 7).sum())
    if spikes:
        score -= min(0.5, 0.15 * spikes)
        notes.append(f"{spikes} pitch jump(s)")
    n = len(semis)
    tail = semis[int(n * 0.8) :].mean()
    body = semis[int(n * 0.35) : int(n * 0.75)].mean()
    rise = tail - body
    if expects_rise(sentence):
        if rise < 1.5:
            score -= 0.5
            notes.append(f"question doesn't rise ({rise:+.1f} st)")
    elif rise > 2.5:
        score -= 0.35
        notes.append(f"statement ends rising ({rise:+.1f} st)")
    spread = float(np.percentile(semis, 90) - np.percentile(semis, 10))
    if spread < 2.0:
        score -= 0.2
        notes.append(f"flat melody ({spread:.1f} st range)")
    return max(0.0, score), notes, {"rise_st": round(float(rise), 2), "range_st": round(spread, 2)}


def clean_audio(audio):
    notes = []
    score = 1.0
    if (np.abs(audio) > 0.99).sum() > 2:
        score -= 0.4
        notes.append("clipping")
    # A click is a sample-to-sample jump far above its neighborhood (reads
    # 0 on known-clean speech, where a global threshold read 1000+).
    d = np.abs(np.diff(audio))
    local = np.convolve(d, np.ones(120) / 120, mode="same") + 1e-6
    clicks = int(((d > 0.15) & (d > 10 * local)).sum())
    if clicks > 2:
        score -= 0.3
        notes.append(f"{clicks} click(s)")
    return max(0.0, score), notes


def listen(ear, audio, sr, sentence):
    """Score one take of one sentence. Higher is better; notes explain."""
    expected = words_of(sentence)
    heard = ear.hear(audio, sr)
    heard_words = [re.sub(r"[^a-z0-9']", "", h["w"].lower()) for h in heard]
    heard_words = [w for w in heard_words if w]
    e = wer(expected, heard_words)
    low = [h["w"] for h in heard if h["p"] < 0.55]
    notes = []
    enun = max(0.0, 1.0 - 2.5 * e - 0.12 * len(low))
    if e > 0:
        notes.append(f"heard: \"{' '.join(heard_words)}\"")
    if low:
        notes.append("unclear: " + ", ".join(low))
    # cadence: pauses at in-sentence marks + speaking rate
    idx = align(expected, heard)
    cad = 1.0
    pauses = []
    for wi, mark in punct_slots(sentence):
        a = idx[wi] if wi < len(idx) else None
        b = idx[wi + 1] if wi + 1 < len(idx) else None
        if a is None or b is None:
            continue
        gap = heard[b]["start"] - heard[a]["end"]
        pauses.append({"after": expected[wi], "mark": mark, "gap": round(gap, 3), "at": heard[a]["end"], "next": heard[b]["start"]})
        if gap > PAUSE_MAX.get(mark, 0.6):
            cad -= 0.15
            notes.append(f"long pause at '{mark}' ({gap:.2f}s)")
    dur = len(audio) / sr
    rate = sum(syllables(w) for w in expected) / max(0.5, dur)
    if rate > 5.6:
        cad -= 0.3
        notes.append(f"rushed ({rate:.1f} syll/s)")
    elif rate < 2.6:
        cad -= 0.2
        notes.append(f"dragging ({rate:.1f} syll/s)")
    ton, tnotes, tinfo = tonality(audio, sr, sentence)
    cln, cnotes = clean_audio(audio)
    total = 0.45 * enun + 0.2 * cad + 0.25 * ton + 0.1 * cln
    return {
        "score": round(total, 3),
        "enunciation": round(enun, 3),
        "cadence": round(cad, 3),
        "tonality": round(ton, 3),
        "clean": round(cln, 3),
        "wer": round(e, 3),
        "rate": round(rate, 2),
        "pauses": pauses,
        "notes": notes + tnotes + cnotes,
        **tinfo,
    }


# ---------- editing ----------

def trim(a, sr):
    thr = 0.01 * np.abs(a).max()
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx):
        a = a[max(0, idx[0] - int(0.02 * sr)) : idx[-1] + int(0.06 * sr)]
    return a


def fade(a, sr, ms=12):
    f = int(ms / 1000 * sr)
    if len(a) < 2 * f:
        return a
    r = np.linspace(0, 1, f, dtype=np.float32)
    a = a.copy()
    a[:f] *= r
    a[-f:] *= r[::-1]
    return a


def stretch_pauses(a, sr, pauses):
    """Insert silence so each punctuation gap reaches its target beat."""
    edits = []
    for p in pauses:
        want = PAUSE_MIN.get(p["mark"], 0.2)
        if p["gap"] >= want:
            continue
        lo, hi = int(p["at"] * sr), int(p["next"] * sr)
        if hi - lo < int(0.01 * sr):
            lo, hi = max(0, lo - int(0.02 * sr)), hi + int(0.02 * sr)
        seg = np.abs(a[lo:hi]) if hi > lo else np.array([0.0])
        win = max(1, int(0.01 * sr))
        energy = np.convolve(seg, np.ones(win) / win, mode="same") if len(seg) > win else seg
        cut = lo + int(np.argmin(energy))
        edits.append((cut, want - max(0.0, p["gap"])))
    for cut, extra in sorted(edits, reverse=True):
        a = np.concatenate([a[:cut], np.zeros(int(extra * sr), dtype=np.float32), a[cut:]])
    return a


def level(a, target_rms=0.08):
    rms = np.sqrt((a**2).mean()) + 1e-9
    a = a * (target_rms / rms)
    return (a / max(1.0, np.abs(a).max() / 0.95)).astype(np.float32)


# ---------- lines ----------

def make_line(voice, ear, text, takes, seed_base, log):
    sr = voice.sr
    out = []
    report = []
    for si, sent in enumerate(sentences(text)):
        best = None
        # First clean take wins; otherwise keep trying up to `takes`, and
        # give a still-weak sentence up to twice as many.
        limit = takes
        k = 0
        while k < limit:
            a = trim(voice.take(sent, seed_base + 97 * si + k), sr)
            r = listen(ear, a, sr, sent)
            if best is None or r["score"] > best[1]["score"]:
                best = (a, r, k)
            if r["score"] >= 0.95 and r["wer"] == 0 and not any("unclear" in n or "rise" in n for n in r["notes"]):
                break
            k += 1
            if k == limit and best[1]["score"] < 0.8 and limit == takes:
                limit = takes * 2
        a, r, k = best
        a = fade(stretch_pauses(a, sr, r["pauses"]), sr)
        out.append(level(a))
        end = sent.strip()[-1]
        out.append(np.zeros(int(SENTENCE_PAUSE.get(end, 0.4) * sr), dtype=np.float32))
        report.append({"sentence": sent, "take": k, **r})
        log(f"    [{r['score']:.2f}] {sent}" + (f"  <- {'; '.join(r['notes'])}" if r["notes"] else ""))
    line = np.concatenate(out[:-1]) if len(out) > 1 else out[0]
    return line, report


def plot_line(path, audio, sr, text):
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    t, f0 = pitch_track(audio, sr)
    fig, ax = plt.subplots(2, 1, figsize=(10, 3.6), sharex=True)
    ax[0].plot(np.arange(len(audio)) / sr, audio, lw=0.4, color="#2a2fe0")
    ax[0].set_yticks([])
    f = np.where(f0 > 0, f0, np.nan)
    ax[1].plot(t, f, ".", ms=2, color="#e0453a")
    ax[1].set_ylabel("pitch Hz")
    ax[1].set_xlabel("seconds")
    fig.suptitle(text[:110], fontsize=9)
    fig.tight_layout()
    fig.savefig(path, dpi=90)
    plt.close(fig)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lines", required=True)
    ap.add_argument("--ref", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--only", default=None)
    ap.add_argument("--takes", type=int, default=4)
    ap.add_argument("--exaggeration", type=float, default=0.55)
    ap.add_argument("--cfg", type=float, default=0.35)
    ap.add_argument("--temperature", type=float, default=0.7)
    ap.add_argument("--seed", type=int, default=11)
    ap.add_argument("--publish", action="store_true")
    args = ap.parse_args()

    os.makedirs(args.out, exist_ok=True)
    videos = json.load(open(args.lines))
    if args.only:
        videos = [v for v in videos if v["slug"] in args.only.split(",")]
    voice = Voice(os.path.expanduser(args.ref), args.exaggeration, args.cfg, args.temperature)
    ear = Ear()
    sr = voice.sr
    log = lambda s: print(s, flush=True)

    manifest_path = os.path.join(ROOT, "lib", "lessonVideos", "audio.json")
    manifest = json.load(open(manifest_path)) if os.path.exists(manifest_path) else {}

    for v in videos:
        if os.path.exists(os.path.join(args.out, v["slug"], "report.json")) and not args.only:
            log(f"== {v['slug']} (already done)")
            continue
        log(f"== {v['slug']}")
        vdir = os.path.join(args.out, v["slug"])
        os.makedirs(vdir, exist_ok=True)
        t = INTRO
        track = [np.zeros(int(sr * INTRO), dtype=np.float32)]
        beats, reports = [], []
        for bi, b in enumerate(v["beats"]):
            log(f"  {bi:02d} {b['kind']}")
            lwav = os.path.join(vdir, f"{bi:02d}-{b['kind']}.wav")
            ljson = os.path.join(vdir, f"{bi:02d}-{b['kind']}.json")
            cached = json.load(open(ljson)) if os.path.exists(ljson) and os.path.exists(lwav) else None
            if cached and cached.get("text") == b["text"]:
                line, _ = sf.read(lwav, dtype="float32")
                reports.append(cached)
                log("    (reused)")
            else:
                line, rep = make_line(voice, ear, b["text"], args.takes, args.seed + 1000 * bi, log)
                sf.write(lwav, line, sr)
                plot_line(os.path.join(vdir, f"{bi:02d}-{b['kind']}.png"), line, sr, b["text"])
                # final re-listen of the whole assembled line
                final = listen(ear, line, sr, b["text"])
                entry = {"beat": bi, "kind": b["kind"], "text": b["text"], "sentences": rep, "final": {k: final[k] for k in ("score", "wer", "rate", "notes")}}
                json.dump(entry, open(ljson, "w"), indent=1)
                reports.append(entry)
            dur = LEAD + len(line) / sr + PAD
            if b["kind"] == "question":
                dur = max(dur, b["minDur"])
            if b["kind"] == "recap":
                dur += RECAP_TAIL
            seg = np.zeros(int(sr * dur), dtype=np.float32)
            s0 = int(sr * LEAD)
            seg[s0 : s0 + len(line)] = line[: len(seg) - s0]
            track.append(seg)
            beats.append([round(t, 3), round(t + dur, 3)])
            t += dur
        full = np.concatenate(track)
        wav = os.path.join(vdir, "full.wav")
        sf.write(wav, full, sr)
        json.dump({"slug": v["slug"], "beats": beats, "duration": round(t, 3), "lines": reports}, open(os.path.join(vdir, "report.json"), "w"), indent=1)
        mp3 = os.path.join(vdir, "full.mp3")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-af", "loudnorm=I=-16:TP=-1.5", "-ac", "1", "-b:a", "64k", mp3], check=True)
        if args.publish:
            pub = os.path.join(ROOT, "public", "lesson-audio")
            os.makedirs(pub, exist_ok=True)
            subprocess.run(["cp", mp3, os.path.join(pub, f"{v['slug']}.mp3")], check=True)
            manifest[v["slug"]] = {"src": f"/lesson-audio/{v['slug']}.mp3", "beats": beats, "duration": round(t, 3)}
            json.dump(manifest, open(manifest_path, "w"), indent=1)
        log(f"  done: {t:.1f}s")


if __name__ == "__main__":
    main()
