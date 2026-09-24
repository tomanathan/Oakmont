import { QUESTIONS } from "@/data/questions";
import { CURRICULUM } from "@/data/curriculum";

// The homepage's "try one right now" questions: real items picked straight
// out of the question bank (by subskill and opening words, so any edit to
// the bank shows up here too), each with where it sits in the curriculum --
// section, domain, skill and the exact question type -- so a visitor sees
// how finely the test is broken down. Built on the server; only these few
// items reach the browser.

export interface LandingQuestion {
  q: string;
  choices: string[];
  answer: number;
  explain: string;
  underline: string | null;
  traps: (string | null)[]; // per choice: the trap behind that wrong answer
  why: (string | null)[]; // per choice: why that choice is wrong
  section: string;
  domains: string[]; // every domain in the section, in order
  domain: string;
  skills: string[]; // every skill in the domain, in order
  skill: string;
  types: string[]; // every question type (pattern) in the skill, in order
  type: string;
  skillQuestionCount: number;
}

const PICKS: [subskillId: string, startsWith: string][] = [
  ["rw-transitions", "The experiment produced promising initial results."],
  ["m-linear-eq-1var", "Five less than three times a number"],
  ["rw-words-context", "After three weeks of talks, the negotiations reached an impasse"],
  ["m-percentages", "An item's price increases by 20% and then decreases by 20%."],
  ["rw-central-ideas", "Over the past decade, a city has converted more than sixty vacant lots"],
];

export function landingQuestions(): LandingQuestion[] {
  const out: LandingQuestion[] = [];
  for (const [subskillId, startsWith] of PICKS) {
    const item = (QUESTIONS[subskillId] ?? []).find((q) => q.q.startsWith(startsWith));
    if (!item || !item.pattern) continue;
    for (const sec of CURRICULUM) {
      for (const d of sec.domains) {
        const s = d.subskills.find((x) => x.id === subskillId);
        if (!s) continue;
        const pattern = s.patterns.find((p) => p.name === item.pattern);
        out.push({
          q: item.q,
          choices: item.choices,
          answer: item.answer,
          explain: item.explain,
          underline: item.underline ?? null,
          traps: item.choices.map((_, i) => {
            const t = item.trapFor?.[i];
            return t === null || t === undefined ? null : pattern?.traps[t] ?? null;
          }),
          why: item.choices.map((_, i) => item.why?.[i] ?? null),
          section: sec.section,
          domains: sec.domains.map((x) => x.domain),
          domain: d.domain,
          skills: d.subskills.map((x) => x.name),
          skill: s.name,
          types: s.patterns.map((p) => p.name),
          type: item.pattern,
          skillQuestionCount: QUESTIONS[subskillId]?.length ?? 0,
        });
      }
    }
  }
  return out;
}
