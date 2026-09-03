import type { PlanWeek } from "@/data/curriculum";
import { utcDayDiff } from "./dateOnly";

export type DayType = "lesson" | "test" | "review" | "rest";

export interface PlanDay {
  day: number; // 1-7
  dayName: string;
  type: DayType;
  subskillIds: string[]; // for "lesson" and "review" days
  testNumber?: number; // for "test" days
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Expands one week of the plan into a 7-day breakdown. Practice test days
 * are placed at the end of the week, working backward so they never
 * collide even when a short custom timeline packs more than one test into
 * the same week -- grading/reviewing results happens right on the test day
 * itself rather than eating a separate day.
 *
 * The remaining days get that week's new subskills first, spread evenly.
 * Once those run out, leftover days cycle through a review pass (this
 * week's subskills, then earlier weeks' via `priorSubskillIds`) instead of
 * sitting empty -- a week with only one new subskill still gets real
 * practice on every day. At most one day per week is held back as an
 * actual rest day, and only when there's enough room to spare one.
 */
export function buildDayPlan(week: PlanWeek, priorSubskillIds: string[] = [], dayCount: number = 7): PlanDay[] {
  // Only the plan's very last week is ever shorter than 7 days (truncated
  // to land exactly on a custom SAT target date instead of drifting a few
  // days past or short of it -- see getTodayPlanItem/the plan pages).
  const count = Math.max(1, Math.min(7, Math.round(dayCount)));
  const days: PlanDay[] = Array.from({ length: count }, (_, i) => ({
    day: i + 1,
    dayName: DAY_NAMES[i],
    type: "rest",
    subskillIds: [],
  }));

  let cursor = count;
  for (const testNumber of [...week.testNumbers].reverse()) {
    if (cursor < 1) break;
    days[cursor - 1] = { ...days[cursor - 1], type: "test", testNumber };
    cursor--;
  }

  const lessonDayCount = Math.max(0, cursor);
  const n = week.subskillIds.length;
  const restBudget = lessonDayCount >= 2 ? 1 : 0;
  const activeDayCount = lessonDayCount - restBudget;

  let assigned = 0;
  let d = 0;
  for (; d < activeDayCount && assigned < n; d++) {
    const remainingDays = activeDayCount - d;
    const remainingSubs = n - assigned;
    const count = Math.max(1, Math.ceil(remainingSubs / remainingDays));
    days[d] = { ...days[d], type: "lesson", subskillIds: week.subskillIds.slice(assigned, assigned + count) };
    assigned += count;
  }

  const reviewPool = [...week.subskillIds, ...priorSubskillIds];
  for (let r = 0; d < activeDayCount && reviewPool.length > 0; d++, r++) {
    days[d] = { ...days[d], type: "review", subskillIds: [reviewPool[r % reviewPool.length]] };
  }

  return days;
}

export interface TodayPlanItem {
  week: number;
  day: PlanDay;
}

/**
 * Finds exactly what today's slot in the plan is -- the same week/day math
 * the plan page uses to highlight "Today", but exposed as a standalone
 * lookup so the dashboard can pull today's items (and a "start here" link)
 * into its own "what am I doing today" card, instead of the plan being
 * something a student has to visit separately to find out.
 *
 * `totalDays`, when given, is the plan's *exact* length (a custom timeline
 * built from a target SAT date, which rarely lands on a clean multiple of
 * 7 -- see courseLengthDaysForUser). It truncates the final week to the
 * days that actually exist, so "today" is never reported inside days that
 * fall after the real exam date. Omit it for the default fixed-length
 * plan, where every week is a full 7 days.
 *
 * Returns null once the plan has run out (today falls after the last real
 * day, e.g. test day itself has arrived, or an expired custom timeline).
 */
export function getTodayPlanItem(
  studyPlan: PlanWeek[],
  courseStartDate: Date | string,
  now: Date = new Date(),
  totalDays?: number
): TodayPlanItem | null {
  const daysElapsed = utcDayDiff(courseStartDate, now);
  if (daysElapsed < 0) return null;
  if (totalDays !== undefined && daysElapsed >= totalDays) return null;

  const weekIndex = Math.floor(daysElapsed / 7);
  const week = studyPlan[weekIndex];
  if (!week) return null;

  const isLastWeek = weekIndex === studyPlan.length - 1;
  const dayCount = isLastWeek && totalDays !== undefined ? totalDays - weekIndex * 7 : 7;

  const dayOfWeek = (daysElapsed % 7) + 1; // 1-7
  if (dayOfWeek > dayCount) return null;

  const priorSubskillIds = studyPlan.slice(0, weekIndex).flatMap((w) => w.subskillIds);
  const days = buildDayPlan(week, priorSubskillIds, dayCount);
  const day = days[dayOfWeek - 1];
  if (!day) return null;

  return { week: week.week, day };
}
