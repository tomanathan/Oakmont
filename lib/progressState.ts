// Where a student stands on each subskill, derived in exactly one place so
// the dashboard, plan, parent view, pet and costume unlocks can never
// disagree about what "mastered" means.
//
//   new        -- never quizzed
//   attempted  -- quizzed, not yet perfect
//   passed     -- a perfect quiz: she can do it when she knows what's coming
//   mastered   -- then answered it correctly in a later mixed review, where
//                 nothing said which skill was being tested
//   due        -- mastered, but it's been long enough that it needs a
//                 refresher. Still counts as mastered (outfits and domain
//                 completions are never taken back); it's just flagged and
//                 pulled into mixed review until she gets it right again.

export interface SubskillProgress {
  bestScore: number;
  total: number;
  passed: boolean;
  mastered: boolean;
  due: boolean;
}

export type ProgressMap = Record<string, SubskillProgress>;

export type SubskillStatus = "new" | "attempted" | "passed" | "mastered" | "due";

export interface ProgressRowLike {
  subskillId: string;
  bestScore: number;
  total: number;
  passedAt?: Date | null;
  masteredAt?: Date | null;
  reviewDueAt?: Date | null;
}

export function progressFromRow(row: ProgressRowLike, now: Date = new Date()): SubskillProgress {
  const mastered = !!row.masteredAt;
  return {
    bestScore: row.bestScore,
    total: row.total,
    passed: mastered || !!row.passedAt || row.bestScore === row.total,
    mastered,
    due: mastered && !!row.reviewDueAt && row.reviewDueAt.getTime() <= now.getTime(),
  };
}

export function progressMapFromRows(rows: ProgressRowLike[], now: Date = new Date()): ProgressMap {
  const map: ProgressMap = {};
  for (const row of rows) map[row.subskillId] = progressFromRow(row, now);
  return map;
}

export function statusOf(p: SubskillProgress | undefined): SubskillStatus {
  if (!p) return "new";
  if (p.mastered) return p.due ? "due" : "mastered";
  if (p.passed) return "passed";
  return "attempted";
}

export const isPassed = (p: SubskillProgress | undefined) => !!p && p.passed;
export const isMastered = (p: SubskillProgress | undefined) => !!p && p.mastered;

// Refreshers come due on a widening interval: three weeks after mastery,
// then doubling with each correct refresher, capped at three months. A
// miss in review brings it due again right away.
export const FIRST_REVIEW_INTERVAL_DAYS = 21;
export const MAX_REVIEW_INTERVAL_DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;

export function nextReviewInterval(current: number): number {
  return Math.min(MAX_REVIEW_INTERVAL_DAYS, Math.max(FIRST_REVIEW_INTERVAL_DAYS, Math.round(current * 2)));
}

export function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * DAY_MS);
}
