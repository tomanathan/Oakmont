"""Publishes finished voice tracks into the app.

For every video with a finished run (report.json) whose spoken lines still
match the current scripts word for word, copies its mp3 to
public/lesson-audio/<slug>.mp3 and records its beat timings in
lib/lessonVideos/audio.json. Videos whose script changed since they were
voiced are left out (they play captions-only until re-voiced), so the audio
can never disagree with the captions.

  python3 scripts/voice/publish.py --run scripts/voice/out/michael
"""
import argparse, json, os, shutil

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lines", default=os.path.join(ROOT, "scripts", "voice", "lines.json"))
    ap.add_argument("--run", required=True)
    args = ap.parse_args()

    current = {v["slug"]: [b["text"] for b in v["beats"]] for v in json.load(open(args.lines))}
    pub = os.path.join(ROOT, "public", "lesson-audio")
    os.makedirs(pub, exist_ok=True)
    manifest = {}
    stale, missing = [], []
    for slug, texts in current.items():
        rep_path = os.path.join(args.run, slug, "report.json")
        if not os.path.exists(rep_path):
            missing.append(slug)
            continue
        rep = json.load(open(rep_path))
        if [l["text"] for l in rep["lines"]] != texts:
            stale.append(slug)
            continue
        shutil.copyfile(os.path.join(args.run, slug, "full.mp3"), os.path.join(pub, f"{slug}.mp3"))
        manifest[slug] = {"src": f"/lesson-audio/{slug}.mp3", "beats": rep["beats"], "duration": rep["duration"]}
    # Drop audio files that are no longer published.
    for f in os.listdir(pub):
        if f.endswith(".mp3") and f[:-4] not in manifest:
            os.remove(os.path.join(pub, f))
    json.dump(manifest, open(os.path.join(ROOT, "lib", "lessonVideos", "audio.json"), "w"), indent=1, sort_keys=True)
    print(f"published {len(manifest)}, stale {len(stale)}, not voiced yet {len(missing)}")
    for s in stale:
        print("  stale:", s)


if __name__ == "__main__":
    main()
