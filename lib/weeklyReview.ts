import { utcDayDiff } from "./dateOnly";

// The weekly review: once each week of the plan, a longer mixed set across
// everything learned so far (the same draw as mixed review, see
// lib/reviewSet.ts, which already leans toward whatever's gone longest
// unseen). On a long plan it's what keeps week 2's lessons alive in week
// 20. One finished set per plan week is recorded (the WeeklyReview table),
// and the dashboard counts the weeks in a row.

export const WEEKLY_REVIEW_SIZE = 15;

/** Which week of the plan `now` falls in (week 1 starts the day the account was made). */
export function planWeekOf(courseStart: Date | string, now: Date = new Date()): number {
  return Math.max(1, Math.floor(utcDayDiff(courseStart, now) / 7) + 1);
}

/**
 * Weeks reviewed back to back, ending this week if it's done, or last week
 * if this week's is still to come (a week in progress doesn't break it).
 */
export function weeksInARow(reviewedWeeks: number[], currentWeek: number): number {
  const done = new Set(reviewedWeeks);
  let w = done.has(currentWeek) ? currentWeek : currentWeek - 1;
  let n = 0;
  while (w >= 1 && done.has(w)) {
    n++;
    w--;
  }
  return n;
}
