// Shared helpers for putting dates on one calendar-day grid.
//
// Every date a student picks in this app -- a target SAT date, a practice
// test's date -- has no meaningful time-of-day: it's a calendar day, and a
// "YYYY-MM-DD" date-only string parses to UTC midnight per the ECMA-262
// spec. So the grid is "a calendar day, stored as that day's UTC midnight".
//
// Everything else this app buckets day-by-day (account creation, "now",
// last-active timestamps) is a real instant, and which day an instant falls
// on depends on where the student is: 5pm in Los Angeles is already
// tomorrow in UTC. localDay() turns an instant into the student's own
// calendar day on that same grid, using the zone their browser reported
// (User.timeZone); with no zone yet it falls back to the UTC day. Once both
// sides are on the grid, utcDayDiff/addUTCDays/formatUTCDate do the rest.
//
// The bug this file exists to prevent is reading a day off a Date with
// LOCAL-timezone accessors (setHours(0,0,0,0), getDate()/setDate(),
// toLocaleDateString without a timeZone) anywhere in the read/display
// chain: that answers for wherever the server or browser happens to run,
// not for the student. Use these helpers instead of raw Date methods for
// any date-only value, any instant that needs a day, or any day-count math.

import { zoneDayFormatter } from "./timeZone";

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

/**
 * The student's calendar day at `instant`, in their zone `tz`, as that day's
 * UTC midnight -- on the same grid as date-only values, so utcDayDiff and
 * friends work on it. A null or unknown zone gives the UTC day.
 */
export function localDay(instant: Date | string, tz: string | null): Date {
  const date = typeof instant === "string" ? new Date(instant) : instant;
  const f = tz ? zoneDayFormatter(tz) : null;
  if (!f || isNaN(date.getTime())) return startOfUTCDay(date);
  let y = 0;
  let m = 0;
  let d = 0;
  for (const part of f.formatToParts(date)) {
    if (part.type === "year") y = Number(part.value);
    else if (part.type === "month") m = Number(part.value);
    else if (part.type === "day") d = Number(part.value);
  }
  return new Date(Date.UTC(y, m - 1, d));
}

/** Whole calendar days in the student's zone from instant `from` to instant `to`. */
export function localDayDiff(from: Date | string, to: Date | string, tz: string | null): number {
  return utcDayDiff(localDay(from, tz), localDay(to, tz));
}

/** The student's calendar day at `instant` as "YYYY-MM-DD". */
export function localDayKey(instant: Date | string, tz: string | null): string {
  return localDay(instant, tz).toISOString().slice(0, 10);
}
