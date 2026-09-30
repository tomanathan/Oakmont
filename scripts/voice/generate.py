"""Generates Ozho's voice for the lesson videos, locally and for free.

Reads the spoken lines (see scripts/export-lesson-video-lines.ts), makes each
one in the chosen voice, and stitches one track per video with the beats laid
out so the animation can follow the voice. Writes:
  public/lesson-audio/<slug>.mp3
  lib/lessonVideos/audio.json   (slug -> beat start/end times, duration)

Run with the voice environment (~/oakmont-voice/env/bin/python):
  python scripts/voice/generate.py --lines /tmp/lesson-video-lines.json \
      --engine kokoro --voice af_heart [--only <slug>]
  python scripts/voice/generate.py ... --engine chatterbox --exaggeration 0.5
"""
import argparse, json, os, subprocess, tempfile
import numpy as np
import soundfile as sf

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
AUDIO_DIR = os.path.join(ROOT, "public", "lesson-audio")
MANIFEST = os.path.join(ROOT, "lib", "lessonVideos", "audio.json")

INTRO = 1.7  # the Polaroid slaps down and Ozho walks in before he talks
LEAD = 0.15  # a breath before each line
PAD = 0.5  # and after it
RECAP_TAIL = 1.2


def engine(args):
    if args.engine == "kokoro":
        from kokoro import KPipeline

        pipe = KPipeline(lang_code="a")

        def say(text):
            parts = [np.asarray(a, dtype=np.float32) for _, _, a in pipe(text, voice=args.voice, speed=args.speed)]
            return np.concatenate(parts), 24000

        return say
    import torch
    from chatterbox.tts import ChatterboxTTS

    dev = "mps" if torch.backends.mps.is_available() else "cpu"
    model = ChatterboxTTS.from_pretrained(device=dev)

    # Chatterbox's Perth watermark sits only ~15 dB under the voice here and
    # is heard as constant static, so it's skipped. (The app labels the
    # voice as AI instead.)
    class NoWatermark:
        def apply_watermark(self, wav, sample_rate):
            return wav

    model.watermarker = NoWatermark()

    def say(text):
        torch.manual_seed(args.seed)
        kw = dict(exaggeration=args.exaggeration, cfg_weight=args.cfg, temperature=args.temperature)
        if args.ref:
            kw["audio_prompt_path"] = args.ref
        wav = model.generate(text, **kw)
        return wav.squeeze().cpu().numpy().astype(np.float32), model.sr

    return say


def clean(a, sr):
    """Trim silence, soft 12ms fades, and match loudness line to line."""
    thr = 0.01 * np.abs(a).max()
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx):
        a = a[max(0, idx[0] - int(0.03 * sr)) : idx[-1] + int(0.08 * sr)]
    f = int(0.012 * sr)
    ramp = np.linspace(0, 1, f, dtype=np.float32)
    a = a.copy()
    a[:f] *= ramp
    a[-f:] *= ramp[::-1]
    rms = np.sqrt((a**2).mean()) + 1e-9
    a = a * (0.08 / rms)
    return (a / max(1.0, np.abs(a).max() / 0.95)).astype(np.float32)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lines", required=True)
    ap.add_argument("--engine", choices=["kokoro", "chatterbox"], default="kokoro")
    ap.add_argument("--voice", default="af_heart")
    ap.add_argument("--speed", type=float, default=1.0)
    ap.add_argument("--exaggeration", type=float, default=0.5)
    ap.add_argument("--cfg", type=float, default=0.35)
    ap.add_argument("--temperature", type=float, default=0.7)
    ap.add_argument("--ref", default=None, help="reference voice clip (Chatterbox)")
    ap.add_argument("--seed", type=int, default=11)
    ap.add_argument("--only", default=None)
    args = ap.parse_args()

    videos = json.load(open(args.lines))
    if args.only:
        videos = [v for v in videos if v["slug"] == args.only]
    os.makedirs(AUDIO_DIR, exist_ok=True)
    manifest = json.load(open(MANIFEST)) if os.path.exists(MANIFEST) else {}
    say = engine(args)

    for v in videos:
        sr = None
        clips = []
        for b in v["beats"]:
            audio, sr = say(b["text"])
            clips.append(clean(audio, sr))
        t = INTRO
        beats = []
        track = [np.zeros(int(sr * INTRO), dtype=np.float32)]
        for b, clip in zip(v["beats"], clips):
            clip_dur = len(clip) / sr
            dur = LEAD + clip_dur + PAD
            if b["kind"] == "question":
                dur = max(dur, b["minDur"])  # time to read the passage, too
            if b["kind"] == "recap":
                dur += RECAP_TAIL
            seg = np.zeros(int(sr * dur), dtype=np.float32)
            start = int(sr * LEAD)
            seg[start : start + len(clip)] = clip[: len(seg) - start]
            track.append(seg)
            beats.append([round(t, 3), round(t + dur, 3)])
            t += dur
        with tempfile.TemporaryDirectory() as tmp:
            wav = os.path.join(tmp, "v.wav")
            sf.write(wav, np.concatenate(track), sr)
            out = os.path.join(AUDIO_DIR, f"{v['slug']}.mp3")
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-af", "loudnorm=I=-16:TP=-1.5", "-ac", "1", "-b:a", "64k", out],
                check=True,
            )
        manifest[v["slug"]] = {"src": f"/lesson-audio/{v['slug']}.mp3", "beats": beats, "duration": round(t, 3)}
        json.dump(manifest, open(MANIFEST, "w"), indent=1)
        print(f"{v['slug']}: {t:.1f}s", flush=True)


if __name__ == "__main__":
    main()
