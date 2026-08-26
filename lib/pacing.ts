/** Default study plan length (26 weeks) when a student hasn't set a target SAT date. */
export const DEFAULT_COURSE_LENGTH_DAYS = 26 * 7;
export const MIN_COURSE_LENGTH_DAYS = 4 * 7;
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
 * SAT date) into a sane course length: at least 4 weeks (cramming is still a
 * plan), at most a year.
 */
export function clampCourseLengthDays(days: number): number {
  return Math.min(MAX_COURSE_LENGTH_DAYS, Math.max(MIN_COURSE_LENGTH_DAYS, Math.round(days)));
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
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysUntilTest = Math.ceil(
    (startOfDay(targetTestDate).getTime() - startOfDay(createdAt).getTime()) / msPerDay
  );
  return clampCourseLengthDays(daysUntilTest);
}

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
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
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysElapsed = Math.floor(
    (startOfDay(now).getTime() - startOfDay(startDate).getTime()) / msPerDay
  );
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
    totalWeeks: Math.max(1, Math.round(courseLengthDays / 7)),
    pctExpected,
    pctComplete,
    unitsAhead: Math.round(diff),
    status,
  };
}
