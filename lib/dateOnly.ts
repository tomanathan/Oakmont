// Shared helpers for treating dates as UTC calendar days.
//
// Every date a student picks in this app -- a target SAT date, a practice
// test's date -- has no meaningful time-of-day: it's a calendar day, and a
// "YYYY-MM-DD" date-only string parses to UTC midnight per the ECMA-262
// spec. Every other date this app buckets day-by-day (account creation,
// "now", last-active timestamps) needs to land on that *same* UTC calendar
// grid, or day-difference math silently drifts depending on what timezone
// the server (or the student's own browser, for client-rendered dates)
// happens to be running in.
//
// Concretely: `new Date(dateOnlyString)` is already correct (UTC midnight).
// The bug this file exists to prevent is everything downstream of that --
// using LOCAL-timezone accessors (setHours(0,0,0,0), getDate()/setDate(),
// toLocaleDateString without timeZone: "UTC") anywhere in the read/display
// chain reintroduces an off-by-one day for any timezone behind UTC, which
// is most of the SAT's own market (all of the Americas). Use these helpers
// instead of raw Date methods for any date-only value, or any day-count
// math involving one.

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** A "YYYY-MM-DD" input value, parsed as UTC midnight. Rejects anything else. */
export function parseDateOnly(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/** The UTC calendar-day start of `d` -- use instead of local setHours(0,0,0,0). */
export function startOfUTCDay(d: Date | string): Date {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** Whole UTC calendar days from `from` to `to` (negative if `to` is earlier). */
export function utcDayDiff(from: Date | string, to: Date | string): number {
  return Math.round((startOfUTCDay(to).getTime() - startOfUTCDay(from).getTime()) / MS_PER_DAY);
}

/** `d`'s UTC calendar day, shifted by `days` (may be negative). */
export function addUTCDays(d: Date | string, days: number): Date {
  return new Date(startOfUTCDay(d).getTime() + days * MS_PER_DAY);
}

/** Formats a date-only value the same way regardless of the viewer's timezone. */
export function formatUTCDate(d: Date | string, opts: Intl.DateTimeFormatOptions = {}): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString(undefined, { ...opts, timeZone: "UTC" });
}
