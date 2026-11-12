import { ALL_SUBSKILLS, CURRICULUM, type Pattern, type WorkedExample } from "@/data/curriculum";
import { QUESTIONS, type Question } from "@/data/questions";
import { slugForSubskill, slugify } from "@/lib/skillSlugs";
import { STARTER_QUESTIONS } from "@/lib/starterQuestions";

// What the public skill pages (app/sat) may show of a skill: its name and
// place in the test, the names of its question types with one opening
// sentence each, one question type taught in full with one worked example,
// three practice questions and two tips. Built on the server only; a page
// passes the browser nothing but the three practice questions. The lesson
// and the rest of the bank stay behind the signup.

export const SITE = "https://oakmontsat.com";

// The questions /start opens with (STARTER_QUESTIONS in lib/starterQuestions.ts).
// Kept off these pages so a visitor who goes on to /start meets questions they
// haven't already seen here.
const STARTER_OPENINGS = STARTER_QUESTIONS.map((s) => s.startsWith);

export function isStarterQuestion(q: { q: string }): boolean {
  return STARTER_OPENINGS.some((s) => q.q.startsWith(s));
}

export type Difficulty = "easy" | "medium" | "hard";
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

/** The fields of a bank question the practice widget needs, and no more. */
export interface PracticeQuestion {
  q: string;
  choices: string[];
  answer: number;
  explain: string;
  difficulty: Difficulty;
  why: (string | null)[] | null;
  underline: string | null;
  figure: Question["figure"] | null;
}

// Some bank questions are the lesson's own worked examples, word for word
// (or with a line added). Compared on letters and digits only.
function sameQuestion(a: string, b: string): boolean {
  const x = a.replace(/[^A-Za-z0-9]/g, "").toLowerCase();
  const y = b.replace(/[^A-Za-z0-9]/g, "").toLowerCase();
  return x === y || (Math.min(x.length, y.length) > 60 && (x.includes(y) || y.includes(x)));
}

/**
 * One easy, one medium and one hard question from a skill's bank, in that
 * order, never a /start question and never one of the lesson's worked
 * examples (`examples`): the page already shows one of those worked, and
 * the rest are the lesson's to show. Within a difficulty the first in bank
 * order wins, after these preferences: no figure (a phone-sized page reads
 * better without one, and search results show only text), no underline
 * (the underline is lost in the structured data), a reason written for each
 * wrong choice, and a question type not already picked. A difficulty with
 * nothing usable is filled from the others, so a skill always gets three
 * while its bank has three.
 */
export function pickPracticeQuestions(bank: Question[], examples: string[] = []): Question[] {
  const usable = bank
    .map((q, index) => ({ q, index }))
    .filter(({ q }) => !isStarterQuestion(q) && !examples.some((e) => sameQuestion(e, q.q)));
  const picked: { q: Question; index: number }[] = [];
  const rank = ({ q, index }: { q: Question; index: number }) => [
    q.figure ? 1 : 0,
    q.underline ? 1 : 0,
    q.why?.some(Boolean) ? 0 : 1,
    q.pattern && picked.some((p) => p.q.pattern === q.pattern) ? 1 : 0,
    index,
  ];
  const best = (cands: { q: Question; index: number }[]) =>
    [...cands].sort((a, b) => {
      const ra = rank(a);
      const rb = rank(b);
      for (let i = 0; i < ra.length; i++) if (ra[i] !== rb[i]) return ra[i] - rb[i];
      return 0;
    })[0];
  for (const d of DIFFICULTIES) {
    const choice = best(usable.filter((c) => c.q.difficulty === d && !picked.includes(c)));
    if (choice) picked.push(choice);
  }
  while (picked.length < 3) {
    const choice = best(usable.filter((c) => !picked.includes(c)));
    if (!choice) break;
    picked.push(choice);
  }
  const order = (q: Question) => DIFFICULTIES.indexOf(q.difficulty ?? "medium");
  return picked.map((p) => p.q).sort((a, b) => order(a) - order(b));
}

/**
 * The question type taught in full: the first one, unless its first worked
 * example needs a figure or diagram and a later type's first example
 * doesn't. When every type's example has one, the first is still taught and
 * its figure is drawn.
 */
export function featuredPatternIndex(patterns: Pattern[]): number {
  const plain = patterns.findIndex((p) => p.examples[0] && !p.examples[0].figure && !p.examples[0].diagram);
  return plain === -1 ? 0 : plain;
}

/** The opening sentence of a question type's explanation (its teaser). */
export function firstSentence(text: string): string {
  // A sentence can end inside a quotation: "...phrases like 'if we know.' The key move".
  const m = text.match(/^(.+?[.!?]['"’”]?)\s+(?=[A-Z('"‘“])/);
  return m ? m[1] : text;
}

/**
 * The lesson text is written for students inside the course, where it
 * sometimes says "pattern" for a question type and "subskill" for a skill.
 * On the public pages a parent may be reading, so those two words are put
 * the plain way. Only the uses that mean the course's own units are
 * changed; "a straight-line pattern" in a scatterplot is left alone.
 */
export function inPlainWords(text: string, skillName: string): string {
  const name = skillName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text
    .replace(/\bsubskills\b/g, "skills")
    .replace(/\bsubskill\b/g, "skill")
    .replace(/\b(This(?: often-overlooked| trap)?) pattern\b/g, "$1 question type")
    .replace(/\b(on|in|for) this pattern\b/g, "$1 this question type")
    .replace(/\bthe other patterns\b/g, "the other question types")
    .replace(/\b(The most common) pattern\b/g, "$1 question type")
    .replace(new RegExp(`\\b(${name}) pattern\\b`, "g"), "$1 question type");
}

export interface SkillLink {
  id: string;
  slug: string;
  name: string;
}

export interface SkillPreview {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  section: string;
  domain: string;
  skillCount: number;
  types: { name: string; teaser: string }[];
  featured: {
    index: number;
    name: string;
    explanation: string;
    traps: string[];
    example: Pick<WorkedExample, "q" | "choices" | "answer" | "explain" | "difficulty" | "underline" | "figure" | "diagram">;
  };
  practice: PracticeQuestion[];
  tips: string[];
  totalQuestions: number;
  siblings: SkillLink[];
  prev: SkillLink | null;
  next: SkillLink | null;
}

function slugOf(id: string): string {
  const slug = slugForSubskill(id);
  if (!slug) throw new Error(`No public slug for skill ${id}: add it to lib/skillSlugs.ts`);
  return slug;
}

function linkOf(s: { id: string; name: string }): SkillLink {
  return { id: s.id, slug: slugOf(s.id), name: s.name };
}

/**
 * Every skill's public page address, checked against its current name. A
 * skill renamed without its slug updated stops the build here, rather than
 * shipping a page whose address no longer matches its title.
 */
export function allSkillSlugs(): string[] {
  return ALL_SUBSKILLS.map((s) => {
    const slug = slugOf(s.id);
    if (slug !== slugify(s.name)) {
      throw new Error(`Skill ${s.id} is now named "${s.name}" but its slug is "${slug}": update lib/skillSlugs.ts (and redirect the old address)`);
    }
    return slug;
  });
}

export function skillPreview(id: string): SkillPreview | null {
  const at = ALL_SUBSKILLS.findIndex((s) => s.id === id);
  const sub = ALL_SUBSKILLS[at];
  if (!sub) return null;
  const plain = (t: string) => inPlainWords(t, sub.name);

  const fi = featuredPatternIndex(sub.patterns);
  const fp = sub.patterns[fi];
  const ex = fp.examples[0];
  const bank = QUESTIONS[id] ?? [];

  return {
    id,
    slug: slugOf(id),
    name: sub.name,
    blurb: sub.blurb,
    section: sub.section,
    domain: sub.domain,
    skillCount: ALL_SUBSKILLS.length,
    types: sub.patterns.map((p) => ({ name: p.name, teaser: plain(firstSentence(p.explanation)) })),
    featured: {
      index: fi,
      name: fp.name,
      explanation: plain(fp.explanation),
      traps: fp.traps.map(plain),
      example: {
        q: ex.q,
        choices: ex.choices,
        answer: ex.answer,
        explain: plain(ex.explain),
        difficulty: ex.difficulty,
        underline: ex.underline,
        figure: ex.figure,
        diagram: ex.diagram,
      },
    },
    practice: pickPracticeQuestions(
      bank,
      sub.patterns.flatMap((p) => p.examples.map((e) => e.q))
    ).map((q) => ({
      q: q.q,
      choices: q.choices,
      answer: q.answer,
      explain: q.explain,
      difficulty: q.difficulty ?? "medium",
      why: q.why ?? null,
      underline: q.underline ?? null,
      figure: q.figure ?? null,
    })),
    tips: sub.tipsAndTricks.slice(0, 2).map(plain),
    totalQuestions: bank.length,
    siblings: ALL_SUBSKILLS.filter((s) => s.domain === sub.domain && s.id !== id).map(linkOf),
    prev: at > 0 ? linkOf(ALL_SUBSKILLS[at - 1]) : null,
    next: at < ALL_SUBSKILLS.length - 1 ? linkOf(ALL_SUBSKILLS[at + 1]) : null,
  };
}

/** The hub page's outline: every skill by section and domain. */
export function skillOutline() {
  return CURRICULUM.map((sec) => ({
    section: sec.section,
    domains: sec.domains.map((d) => ({
      domain: d.domain,
      skills: d.subskills.map((s) => ({
        id: s.id,
        slug: slugOf(s.id),
        name: s.name,
        blurb: s.blurb,
        typeCount: s.patterns.length,
      })),
    })),
  }));
}

// ---- Search titles and descriptions -----------------------------------------

/** "SAT Transitions: Lesson and Free Practice Questions | Oakmont", with the
 *  tail shortened step by step until it fits in about 60 characters. */
export function seoTitle(name: string): string {
  const tails = [
    ": Lesson and Free Practice Questions",
    ": Lesson and Practice Questions",
    ": Free Practice Questions",
    ": Practice Questions",
    ": Free Practice",
    " Practice",
    "",
  ];
  for (const tail of tails) {
    const t = `SAT ${name}${tail} | Oakmont`;
    if (t.length <= 60) return t;
  }
  return `SAT ${name} | Oakmont`;
}

function listOf(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

/**
 * A 140-160 character description that names the skill and as many of its
 * question types as fit. Tries the most types with the fullest ending
 * first; if nothing lands in range, the longest that stays under 160.
 */
export function seoDescription(name: string, typeNames: string[]): string {
  const n = typeNames.length;
  const endings = [
    " Learn one with a worked example, then try 3 free practice questions.",
    " See a worked example and try 3 free practice questions.",
    " Try 3 free practice questions, with explanations.",
    " Try 3 free practice questions.",
  ];
  const candidates: string[] = [];
  for (let k = n; k >= 1; k--) {
    const shown = typeNames.slice(0, k);
    const lead =
      n === 1
        ? `SAT ${name} has one question type: ${shown[0]}.`
        : k === n
          ? `SAT ${name} has ${n} question types: ${listOf(shown)}.`
          : `SAT ${name} has ${n} question types, including ${listOf(shown)}.`;
    for (const end of endings) candidates.push(lead + end);
  }
  const inRange = candidates.find((c) => c.length >= 140 && c.length <= 160);
  if (inRange) return inRange;
  const fits = candidates.filter((c) => c.length <= 160).sort((a, b) => b.length - a.length);
  return fits[0] ?? candidates[candidates.length - 1];
}
