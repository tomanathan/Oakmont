import { ALL_SUBSKILLS, type Subskill } from "@/data/curriculum";
import { itemsForSubskill, type BankItem } from "@/lib/items";
import {
  isStarterQuestion,
  previewPracticeQuestions,
  sameQuestion,
  workedExampleTexts,
  type Difficulty,
  type PracticeQuestion,
} from "@/lib/skillPreview";
import { slugForSubskill } from "@/lib/skillSlugs";
import { dailyDate } from "@/components/daily/day";

// Which question is the SAT question of the day (app/daily), as a pure
// function of the day's number, so every visitor and every server gets the
// same one and it can be checked ahead of time. Server only: it reads the
// whole bank, and the page passes the browser that one question.
//
// The days alternate between the two sections, Reading and Writing on odd
// days and Math on even ones, as the test itself is split about evenly.
// Each section walks through all of its skills before any comes back, in
// an order that moves between that section's domains rather than spending
// a week in one. Reading and Writing has 10 skills and Math 19, so a
// Reading and Writing skill comes back every 20 days and a Math skill
// every 38.
//
// Within a skill, the questions come up in the order of their item ids
// (lib/items.ts), which are made from each question's own text, so moving
// questions around in the bank changes nothing. Difficulty follows the
// weekday: easy on Monday and Tuesday, medium Wednesday to Friday, hard on
// the weekend, falling back to the nearest difficulty the skill still has
// unused. Once a skill has used every question it can, it starts over.
// Never used: the five questions /start opens with, copies of the lesson's
// worked examples, and the three questions on the skill's public page.
//
// Adding questions to a skill can reorder that skill's walk from then on,
// since a new id may sort ahead of old ones; other skills are unaffected.

const SECTIONS = ["Reading and Writing", "Math"] as const;

/** One section's skills, taking one from each domain in turn. */
function interleaveDomains(skills: Subskill[]): Subskill[] {
  const domains: Subskill[][] = [];
  for (const s of skills) {
    const group = domains.find((d) => d[0].domain === s.domain);
    if (group) group.push(s);
    else domains.push([s]);
  }
  const out: Subskill[] = [];
  for (let i = 0; out.length < skills.length; i++) for (const d of domains) if (d[i]) out.push(d[i]);
  return out;
}

const ROTATION = SECTIONS.map((section) => interleaveDomains(ALL_SUBSKILLS.filter((s) => s.section === section)));

/** Mon-Tue easy, Wed-Fri medium, Sat-Sun hard. `weekday` is 0 for Sunday. */
export function difficultyForWeekday(weekday: number): Difficulty {
  if (weekday === 1 || weekday === 2) return "easy";
  if (weekday >= 3 && weekday <= 5) return "medium";
  return "hard";
}

// Which difficulty to take when the one wanted has run out: the nearest.
// Medium's two neighbours are equally near, so either will do.
const FALLBACK: Record<Difficulty, Difficulty[][]> = {
  easy: [["easy"], ["medium"], ["hard"]],
  medium: [["medium"], ["easy", "hard"]],
  hard: [["hard"], ["medium"], ["easy"]],
};

const pools = new Map<string, BankItem[]>();

/** A skill's questions the daily question may use, in their fixed order. */
export function dailyPool(skillId: string): BankItem[] {
  const cached = pools.get(skillId);
  if (cached) return cached;
  const sub = ALL_SUBSKILLS.find((s) => s.id === skillId);
  const examples = sub ? workedExampleTexts(sub) : [];
  const preview = previewPracticeQuestions(skillId).map((q) => q.q);
  const pool = itemsForSubskill(skillId)
    .filter((q) => !isStarterQuestion(q) && !examples.some((e) => sameQuestion(e, q.q)) && !preview.includes(q.q))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : a.q < b.q ? -1 : a.q > b.q ? 1 : 0));
  pools.set(skillId, pool);
  return pool;
}

export interface DailyPick {
  day: number;
  /** The day's date in New York, "YYYY-MM-DD". */
  date: string;
  weekday: number;
  skill: { id: string; name: string; slug: string; section: string; domain: string };
  /** The weekday's difficulty; the question's own may differ (a fallback). */
  wanted: Difficulty;
  item: BankItem;
}

/** The question of the day for day number `day` (1 or more). */
export function dailyQuestion(day: number): DailyPick {
  const n = Math.max(1, Math.floor(day));
  const half = (n - 1) % 2;
  const order = ROTATION[half];
  const turn = Math.floor((n - 1) / 2);
  const sub = order[turn % order.length];
  const visit = Math.floor(turn / order.length);
  const pool = dailyPool(sub.id);
  if (pool.length === 0) throw new Error(`No questions the daily question can use for ${sub.id}`);

  // Walk this skill's visits from the first, so each one knows which
  // questions the visits before it used.
  const dayOfVisit = (v: number) => 1 + half + 2 * (v * order.length + (turn % order.length));
  const used = new Set<BankItem>();
  let pick = pool[0];
  let wanted: Difficulty = "medium";
  for (let v = 0; v <= visit; v++) {
    if (used.size >= pool.length) used.clear();
    wanted = difficultyForWeekday(dailyDate(dayOfVisit(v)).getUTCDay());
    const left = pool.filter((q) => !used.has(q));
    for (const tier of FALLBACK[wanted]) {
      const found = left.find((q) => tier.includes(q.difficulty ?? "medium"));
      if (found) {
        pick = found;
        break;
      }
    }
    used.add(pick);
  }

  const date = dailyDate(n);
  return {
    day: n,
    date: date.toISOString().slice(0, 10),
    weekday: date.getUTCDay(),
    skill: { id: sub.id, name: sub.name, slug: slugForSubskill(sub.id) ?? "", section: sub.section, domain: sub.domain },
    wanted,
    item: pick,
  };
}

/** The fields the page's question widget needs, and no more. */
export function toPracticeQuestion(q: BankItem): PracticeQuestion {
  return {
    q: q.q,
    choices: q.choices,
    answer: q.answer,
    explain: q.explain,
    difficulty: q.difficulty ?? "medium",
    why: q.why ?? null,
    underline: q.underline ?? null,
    figure: q.figure ?? null,
  };
}
