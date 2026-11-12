import type { PlanWeek } from "@/data/curriculum";
import { buildDayPlan, type TodayPlanItem } from "./studyPlan";
import { weeksInARow } from "./weeklyReview";
import { addUTCDays, formatUTCDate, localDay, utcDayDiff } from "./dateOnly";

// Where today sits against two things the plan schedules once a week: the
// weekly review and the practice test. Worked out in one place so the
// dashboard and /api/plan/next (Ozho's "what next", the quiz's "Up next")
// hand findRecommended the same answer. `courseStart` is the account's
// creation instant; the plan's days start on its calendar day in the
// student's `timeZone`.

export interface WeeklyStatus {
  week: number;
  done: boolean;
  due: boolean; // the plan's weekly review day has come (or passed)
  today: boolean; // ...and it's today
  day: string; // its weekday
  inARow: number;
  // How many questions the set will hold right now (see reviewSetSize).
  questions?: number;
}

/** This week's weekly review: which day the plan puts it on, whether it's done, and the run of weeks. */
export function weeklyStatusFor(
  studyPlan: PlanWeek[],
  todayItem: TodayPlanItem | null,
  courseStart: Date,
  timeZone: string | null,
  courseLengthDays: number,
  reviewedWeeks: number[]
): WeeklyStatus | null {
  if (!todayItem) return null;
  const wi = todayItem.week - 1;
  const days = buildDayPlan(
    studyPlan[wi],
    studyPlan.slice(0, wi).flatMap((w) => w.subskillIds),
    wi === studyPlan.length - 1 ? courseLengthDays - wi * 7 : 7
  );
  const at = days.findIndex((d) => d.weekly);
  if (at < 0) return null;
  const todayAt = todayItem.day.day - 1;
  return {
    week: todayItem.week,
    done: reviewedWeeks.includes(todayItem.week),
    due: todayAt >= at,
    today: todayAt === at,
    day: formatUTCDate(addUTCDays(localDay(courseStart, timeZone), wi * 7 + at), { weekday: "long" }),
    inARow: weeksInARow(reviewedWeeks, todayItem.week),
  };
}

/**
 * On a practice-test day: whether that test is already logged, so the
 * dashboard stops asking for it. A test counts when it was taken or logged
 * in this plan week; a week holding two tests (a short plan) needs two
 * before its second test day clears.
 */
export function todaysTestLogged(
  studyPlan: PlanWeek[],
  todayItem: TodayPlanItem | null,
  courseStart: Date,
  timeZone: string | null,
  tests: { takenAt: Date; createdAt: Date }[]
): boolean {
  if (!todayItem || todayItem.day.type !== "test" || todayItem.day.testNumber === undefined) return false;
  const weekStart = addUTCDays(localDay(courseStart, timeZone), (todayItem.week - 1) * 7);
  // Both arguments are calendar days: takenAt is date-only, while the
  // logged-at instant is put on the student's own day first.
  const inWeek = (d: Date) => {
    const n = utcDayDiff(weekStart, d);
    return n >= 0 && n < 7;
  };
  const nth = (studyPlan[todayItem.week - 1]?.testNumbers.indexOf(todayItem.day.testNumber) ?? 0) + 1;
  return tests.filter((t) => inWeek(t.takenAt) || inWeek(localDay(t.createdAt, timeZone))).length >= Math.max(1, nth);
}
