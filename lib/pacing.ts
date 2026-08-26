/** The study plan is 26 weeks (see data/curriculum.ts buildStudyPlan). */
export const COURSE_LENGTH_DAYS = 26 * 7;

export interface Pacing {
  totalUnits: number;
  completedUnits: number;
  dayOfCourse: number; // 1..COURSE_LENGTH_DAYS, clamped to the course window
  totalDays: number;
  pctExpected: number; // 0-100, how far through the 6-month window "today" is
  pctComplete: number; // 0-100, share of subskills actually done
  unitsAhead: number; // completedUnits vs. steady-pace expectation; negative = behind
  status: "ahead" | "onTrack" | "behind";
}

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

/**
 * Computes where a student stands against a steady-pace line that would
 * finish all `totalUnits` subskills by the end of the 26-week plan.
 */
export function computePacing(
  startDate: Date,
  now: Date,
  totalUnits: number,
  completedUnits: number
): Pacing {
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysElapsed = Math.floor(
    (startOfDay(now).getTime() - startOfDay(startDate).getTime()) / msPerDay
  );
  const dayOfCourse = Math.min(COURSE_LENGTH_DAYS, Math.max(1, daysElapsed + 1));
  const expectedUnits = (dayOfCourse / COURSE_LENGTH_DAYS) * totalUnits;
  const pctExpected = (dayOfCourse / COURSE_LENGTH_DAYS) * 100;
  const pctComplete = totalUnits > 0 ? Math.min(100, (completedUnits / totalUnits) * 100) : 0;
  const diff = completedUnits - expectedUnits;
  const status: Pacing["status"] = diff > 0.5 ? "ahead" : diff < -0.5 ? "behind" : "onTrack";

  return {
    totalUnits,
    completedUnits,
    dayOfCourse,
    totalDays: COURSE_LENGTH_DAYS,
    pctExpected,
    pctComplete,
    unitsAhead: Math.round(diff),
    status,
  };
}
