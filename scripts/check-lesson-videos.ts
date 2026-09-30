// Checks every lesson video script against the curriculum it teaches from.
// Run: ./node_modules/.bin/tsc -p scripts/tsconfig.lessonvideos.json && node /tmp/lvcheck/scripts/check-lesson-videos.js
import { CURRICULUM } from "../data/curriculum";
import { LESSON_VIDEOS } from "../lib/lessonVideos/index";
import { checkScript } from "../components/lessonVideo/timeline";

const problems: string[] = [];
let expected = 0;
const which = process.env.SECTION; // "rw", "math", or both when unset
for (const section of CURRICULUM) {
  const isMath = section.section !== "Reading and Writing";
  if ((which === "rw" && isMath) || (which === "math" && !isMath)) continue;
  for (const d of section.domains)
    for (const s of d.subskills)
      for (const p of s.patterns) {
        expected++;
        const matches = LESSON_VIDEOS.filter((v) => v.subskillId === s.id && v.pattern === p.name);
        if (matches.length === 0) problems.push(`MISSING ${s.id} :: ${p.name}`);
        if (matches.length > 1) problems.push(`DUPLICATE ${s.id} :: ${p.name}`);
        for (const v of matches) problems.push(...checkScript(v, p.examples[v.example]));
      }
}
for (const v of LESSON_VIDEOS) {
  const s = CURRICULUM.flatMap((c) => c.domains).flatMap((d) => d.subskills).find((x) => x.id === v.subskillId);
  if (!s || !s.patterns.some((p) => p.name === v.pattern)) problems.push(`UNKNOWN pattern: ${v.subskillId} :: ${v.pattern}`);
}
const only = process.argv[2];
const shown = only ? problems.filter((p) => p.includes(only)) : problems;
console.log(`${LESSON_VIDEOS.length}/${expected} scripts. ${shown.length} problem(s)${only ? ` matching "${only}"` : ""}.`);
for (const p of shown) console.log(" - " + p);
process.exit(shown.filter((p) => !p.startsWith("MISSING")).length ? 1 : 0);
