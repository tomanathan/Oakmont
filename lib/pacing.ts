import { utcDayDiff } from "./dateOnly";

/** Default study plan length (26 weeks) when a student hasn't set a target SAT date. */
export const DEFAULT_COURSE_LENGTH_DAYS = 26 * 7;
// Not a floor on the plan's actual length (see clampCourseLengthDays) --
// used only to decide when a *real* target date leaves a tight enough
// runway to warn the student about, e.g. on the plan page. A genuine 10-day
// runway must produce a genuine 10-day plan; inflating it to 4 weeks would
// schedule content past the actual exam date.
export const TIGHT_TIMELINE_DAYS = 4 * 7;
export const MAX_COURSE_LENGTH_DAYS = 52 * 7;

export interface Pacing {
  totalUnits: number;
  completedUnits: number;
  dayOfCourse: number; // 1..totalDays, clamped to the course window
  totalDays: number;
  totalWeeks: number;
  pctExpected: number; // 0-100, how far through the course window "today" is
  pctComplete: number; // 0-100, share of subskills actually done
  unitsAhead: number; // completedUnits vs. steady-pace expectation; negative = behind
  status: "ahead" | "onTrack" | "behind";
}

/**
 * Clamps a raw day count (e.g. days between account creation and a target
 * SAT date) into a sane course length: always at least one day (a plan
 * can't have zero or negative length), at most a year. Deliberately does
 * NOT enforce a minimum on the high side -- a target date 10 days out is a
 * real 10-day plan. Inflating it to a longer default would schedule study
 * days (and full-length practice tests) past the actual exam date while
 * telling the student the plan is "paced to finish exactly by then."
 */
export function clampCourseLengthDays(days: number): number {
  return Math.min(MAX_COURSE_LENGTH_DAYS, Math.max(1, Math.round(days)));
}

/**
 * The plan's total length: a custom span from account creation to the
 * student's target SAT date if they've set one, otherwise the default
 * 26-week plan.
 */
export function courseLengthDaysForUser(
  createdAt: Date,
  targetTestDate: Date | null,
  now: Date = new Date()
): number {
  if (!targetTestDate) return DEFAULT_COURSE_LENGTH_DAYS;
  const daysUntilTest = utcDayDiff(createdAt, targetTestDate);
  return clampCourseLengthDays(daysUntilTest);
}

/** Whole calendar days remaining until the target SAT date, or null if none is set. */
export function daysUntilTest(targetTestDate: Date | null, now: Date = new Date()): number | null {
  if (!targetTestDate) return null;
  return utcDayDiff(now, targetTestDate);
}

/**
 * Computes where a student stands against a steady-pace line that would
 * finish all `totalUnits` subskills by the end of the plan (by default a
 * fixed 26 weeks, or a custom length derived from the student's target SAT
 * date -- see clampCourseLengthDays).
 */
export function computePacing(
  startDate: Date,
  now: Date,
  totalUnits: number,
  completedUnits: number,
  courseLengthDays: number = DEFAULT_COURSE_LENGTH_DAYS
): Pacing {
  const daysElapsed = utcDayDiff(startDate, now);
  const dayOfCourse = Math.min(courseLengthDays, Math.max(1, daysElapsed + 1));
  const expectedUnits = (dayOfCourse / courseLengthDays) * totalUnits;
  const pctExpected = (dayOfCourse / courseLengthDays) * 100;
  const pctComplete = totalUnits > 0 ? Math.min(100, (completedUnits / totalUnits) * 100) : 0;
  const diff = completedUnits - expectedUnits;
  const status: Pacing["status"] = diff > 0.5 ? "ahead" : diff < -0.5 ? "behind" : "onTrack";

  return {
    totalUnits,
    completedUnits,
    dayOfCourse,
    totalDays: courseLengthDays,
    // Math.ceil, not round -- must match the week count the plan pages
    // actually build the grid with (Math.ceil(courseLengthDays / 7) in
    // app/plan/page.tsx and app/dashboard/page.tsx), or the last week can
    // read "Week 28 of 27" once totalWeeks rounds down where the grid
    // rounded up.
    totalWeeks: Math.max(1, Math.ceil(courseLengthDays / 7)),
    pctExpected,
    pctComplete,
    unitsAhead: Math.round(diff),
    status,
  };
}
