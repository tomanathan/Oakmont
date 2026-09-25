import { CURRICULUM } from "@/data/curriculum";

// The homepage's showcase problem: one worked example from the curriculum
// that looks hard and has a genuinely satisfying solution (the zigzag
// between parallel lines, solved by drawing one extra parallel line).
// Looked up by its opening words so any edit to the item flows through.
// Built on the server; only this one item reaches the browser.

const SKILL_ID = "m-lines-angles-tri";
const STARTS_WITH = "Lines p and q are parallel. A zigzag";

export interface LandingShowcase {
  q: string;
  choices: string[];
  answer: number;
  why: (string | null)[];
  section: string;
  domain: string;
  skill: string;
  type: string;
  typeIndex: number;
  typeCount: number;
}

export function landingShowcase(): LandingShowcase | null {
  for (const sec of CURRICULUM) {
    for (const d of sec.domains) {
      const s = d.subskills.find((x) => x.id === SKILL_ID);
      if (!s) continue;
      for (const [pi, p] of s.patterns.entries()) {
        const e = p.examples.find((x) => x.q.startsWith(STARTS_WITH));
        if (!e) continue;
        // Shown in a fixed order that doesn't lead with the answer.
        const order = [3, 1, 0, 2].filter((i) => i < e.choices.length);
        return {
          q: e.q,
          choices: order.map((i) => e.choices[i]),
          answer: order.indexOf(e.answer),
          why: order.map((i) => e.why?.[i] ?? null),
          section: sec.section,
          domain: d.domain,
          skill: s.name,
          type: p.name,
          typeIndex: pi,
          typeCount: s.patterns.length,
        };
      }
    }
  }
  return null;
}
