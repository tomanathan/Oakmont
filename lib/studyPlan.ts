import type { PlanWeek } from "@/data/curriculum";

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
export function buildDayPlan(week: PlanWeek, priorSubskillIds: string[] = []): PlanDay[] {
  const days: PlanDay[] = Array.from({ length: 7 }, (_, i) => ({
    day: i + 1,
    dayName: DAY_NAMES[i],
    type: "rest",
    subskillIds: [],
  }));

  let cursor = 7;
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
