import type { PlanWeek } from "@/data/curriculum";

export type DayType = "lesson" | "test" | "review" | "rest";

export interface PlanDay {
  day: number; // 1-7
  dayName: string;
  type: DayType;
  subskillIds: string[]; // for "lesson" days
  testNumber?: number; // for "test" / "review" days
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Expands one week of the plan into a 7-day breakdown. Practice test days
 * (plus a review day right after each) are placed at the end of the week,
 * working backward so they never collide even when a short custom timeline
 * packs more than one test into the same week. Whatever days are left at
 * the front of the week get that week's subskills, spread evenly across
 * them; any day with nothing scheduled is a rest day.
 */
export function buildDayPlan(week: PlanWeek): PlanDay[] {
  const days: PlanDay[] = Array.from({ length: 7 }, (_, i) => ({
    day: i + 1,
    dayName: DAY_NAMES[i],
    type: "rest",
    subskillIds: [],
  }));

  let cursor = 7;
  for (const testNumber of [...week.testNumbers].reverse()) {
    if (cursor < 1) break;
    days[cursor - 1] = { ...days[cursor - 1], type: "review", testNumber };
    cursor--;
    if (cursor < 1) break;
    days[cursor - 1] = { ...days[cursor - 1], type: "test", testNumber };
    cursor--;
  }

  const lessonDayCount = Math.max(0, cursor);
  const n = week.subskillIds.length;
  let assigned = 0;
  for (let d = 0; d < lessonDayCount && assigned < n; d++) {
    const remainingDays = lessonDayCount - d;
    const remainingSubs = n - assigned;
    const count = Math.ceil(remainingSubs / remainingDays);
    days[d] = { ...days[d], type: "lesson", subskillIds: week.subskillIds.slice(assigned, assigned + count) };
    assigned += count;
  }

  return days;
}
