import { ALL_SUBSKILLS, getSubskill } from "@/data/curriculum";
import { itemsForSubskill, type BankItem } from "@/lib/items";
import { statusOf, type ProgressMap, type SubskillStatus } from "@/lib/progressState";
import { subskillWeight } from "@/lib/testWeights";

// Picks today's mixed review: a short set drawn across everything she's
// been introduced to, with nothing telling her which skill each question
// tests -- recognizing that is half of what the real test asks, and the
// one thing a single-subskill quiz can never practice.
//
// Which subskills get questions, strongest pull first:
//   - passed but not yet mastered: this set is how they become mastered
//   - mastered but due a refresher: the point of spacing it out
//   - attempted, not yet passed: still shaky
//   - everything else introduced: a light background share
// scaled by how much of the score the subskill is worth, how long since
// she last saw it, and how often she's been missing (or unsure) lately.
//
// Which questions: ones she's never seen, then ones she missed or wasn't
// sure about, then the least recently seen -- and nothing from the last
// few days if it can be helped, so she's answering from skill, not memory.

export const REVIEW_SET_SIZE = 12;
export const MIN_SUBSKILLS_FOR_REVIEW = 2;
const MAX_PER_SUBSKILL = 3;
const RECENT_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface AttemptLite {
  itemId: string;
  subskillId: string;
  correct: boolean;
  confidence: string | null;
  createdAt: Date;
}

const STATUS_PULL: Record<SubskillStatus, number> = {
  passed: 3,
  due: 2.5,
  attempted: 2,
  mastered: 0.5,
  new: 0,
};

export interface ReviewPlan {
  items: BankItem[];
  toConfirm: string[]; // passed subskills this set can master
  refreshers: string[]; // mastered subskills due a refresher
}

export function introducedSubskills(progress: ProgressMap): string[] {
  return ALL_SUBSKILLS.map((s) => s.id).filter((id) => !!progress[id]);
}

export function reviewReady(progress: ProgressMap): boolean {
  return introducedSubskills(progress).length >= MIN_SUBSKILLS_FOR_REVIEW;
}

/** Counts for the dashboard: what today's mixed review would work on. */
export function reviewCounts(progress: ProgressMap) {
  const ids = introducedSubskills(progress);
  return {
    ready: ids.length >= MIN_SUBSKILLS_FOR_REVIEW,
    toConfirm: ids.filter((id) => statusOf(progress[id]) === "passed").length,
    refreshers: ids.filter((id) => statusOf(progress[id]) === "due").length,
  };
}

export function buildReviewSet(
  progress: ProgressMap,
  attempts: AttemptLite[],
  now: Date = new Date(),
  rng: () => number = Math.random,
  size: number = REVIEW_SET_SIZE
): ReviewPlan {
  const ids = introducedSubskills(progress);
  if (ids.length < MIN_SUBSKILLS_FOR_REVIEW) return { items: [], toConfirm: [], refreshers: [] };

  const bySub = new Map<string, AttemptLite[]>();
  const lastByItem = new Map<string, AttemptLite>();
  for (const a of [...attempts].sort((x, y) => x.createdAt.getTime() - y.createdAt.getTime())) {
    const list = bySub.get(a.subskillId) ?? [];
    list.push(a);
    bySub.set(a.subskillId, list);
    lastByItem.set(a.itemId, a);
  }

  const avgWeight = ids.reduce((acc, id) => acc + subskillWeight(getSubskill(id)!), 0) / ids.length;
  const pull = new Map<string, number>();
  for (const id of ids) {
    const status = statusOf(progress[id]);
    const hist = bySub.get(id) ?? [];
    const last = hist[hist.length - 1];
    const daysSince = last ? (now.getTime() - last.createdAt.getTime()) / DAY_MS : 30;
    const recent = hist.slice(-10);
    const shaky = recent.length
      ? recent.filter((a) => !a.correct || a.confidence === "unsure" || a.confidence === "guessed").length / recent.length
      : 0.5;
    pull.set(
      id,
      STATUS_PULL[status] *
        (subskillWeight(getSubskill(id)!) / avgWeight) *
        (1 + Math.min(daysSince, 30) / 15) *
        (1 + shaky)
    );
  }

  // Confirmations and refreshers are guaranteed a question each (most
  // urgent first); the rest of the set is drawn in proportion to pull.
  const counts = new Map<string, number>();
  const urgent = ids
    .filter((id) => ["passed", "due"].includes(statusOf(progress[id])))
    .sort((a, b) => pull.get(b)! - pull.get(a)!)
    .slice(0, Math.ceil(size / 2));
  for (const id of urgent) counts.set(id, 1);

  let slots = size - urgent.length;
  const capacity = (id: string) => Math.min(MAX_PER_SUBSKILL, itemsForSubskill(id).length);
  while (slots > 0) {
    const open = ids.filter((id) => (counts.get(id) ?? 0) < capacity(id));
    if (open.length === 0) break;
    const total = open.reduce((acc, id) => acc + pull.get(id)! + 0.05, 0);
    let roll = rng() * total;
    let pick = open[open.length - 1];
    for (const id of open) {
      roll -= pull.get(id)! + 0.05;
      if (roll <= 0) {
        pick = id;
        break;
      }
    }
    counts.set(pick, (counts.get(pick) ?? 0) + 1);
    slots--;
  }

  const chosen: BankItem[] = [];
  for (const [id, n] of counts) {
    const scored = itemsForSubskill(id).map((item) => {
      const last = lastByItem.get(item.id);
      let score = rng() * 0.5;
      if (!last) score += 2;
      else {
        const days = (now.getTime() - last.createdAt.getTime()) / DAY_MS;
        if (!last.correct) score += 3;
        else if (last.confidence === "unsure" || last.confidence === "guessed") score += 2;
        score += Math.min(days, 30) / 10;
        if (days < RECENT_DAYS) score -= 4;
      }
      return { item, score };
    });
    scored.sort((a, b) => b.score - a.score);
    chosen.push(...scored.slice(0, n).map((x) => x.item));
  }

  return {
    items: interleave(chosen, rng),
    toConfirm: ids.filter((id) => statusOf(progress[id]) === "passed" && counts.has(id)),
    refreshers: ids.filter((id) => statusOf(progress[id]) === "due" && counts.has(id)),
  };
}

// Random order, drawn so the same subskill never comes twice in a row
// when anything else is left -- two in a row would hand her the answer to
// "what kind of question is this?"
function interleave(items: BankItem[], rng: () => number): BankItem[] {
  const pool = [...items];
  const out: BankItem[] = [];
  while (pool.length) {
    const prev = out[out.length - 1]?.subskillId;
    const options = pool.filter((x) => x.subskillId !== prev);
    const from = options.length ? options : pool;
    // Weighted toward subskills with the most left, so a subskill's last
    // few questions don't pile up at the end with nothing to split them.
    const left = (id: string) => pool.filter((x) => x.subskillId === id).length;
    const weights = from.map((x) => left(x.subskillId) ** 2);
    let roll = rng() * weights.reduce((a, b) => a + b, 0);
    let pick = from[from.length - 1];
    for (let i = 0; i < from.length; i++) {
      roll -= weights[i];
      if (roll <= 0) {
        pick = from[i];
        break;
      }
    }
    out.push(pick);
    pool.splice(pool.indexOf(pick), 1);
  }
  return out;
}
