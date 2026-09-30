// Writes every lesson video's spoken lines, in beat order, as JSON for the
// voice generator (scripts/voice/generate.py).
// Run: ./node_modules/.bin/tsc -p scripts/tsconfig.lessonvideos.json && node /tmp/lvcheck/scripts/export-lesson-video-lines.js > /tmp/lesson-video-lines.json
import { CURRICULUM } from "../data/curriculum";
import { LESSON_VIDEOS, videoSlug } from "../lib/lessonVideos/index";
import { buildTimeline } from "../components/lessonVideo/timeline";

const subskills = CURRICULUM.flatMap((c) => c.domains).flatMap((d) => d.subskills);
const out = LESSON_VIDEOS.map((v) => {
  const p = subskills.find((s) => s.id === v.subskillId)!.patterns.find((x) => x.name === v.pattern)!;
  const tl = buildTimeline(v, p.examples[v.example]);
  return {
    slug: videoSlug(v),
    beats: tl.beats.map((b) => ({ kind: b.kind, i: b.i, text: b.say, minDur: +(b.end - b.start).toFixed(2) })),
  };
});
process.stdout.write(JSON.stringify(out, null, 1));
