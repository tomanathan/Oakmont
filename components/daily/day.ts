import { addUTCDays, localDayKey, utcDayDiff } from "@/lib/dateOnly";

// The question of the day's calendar: one question per calendar day in New
// York, the same for everyone wherever they are, numbered from day 1 on
// the day it launched. Data-free, so the browser can use it too (to notice
// that a new day has started while the page is open).

export const DAILY_ZONE = "America/New_York";
export const DAILY_FIRST_DAY = "2026-11-13";

/** Today's number at `now`. Below 1 before launch day. */
export function dailyNumberAt(now: Date): number {
  return utcDayDiff(DAILY_FIRST_DAY, localDayKey(now, DAILY_ZONE)) + 1;
}

/** The calendar day of question `day`, as that day's UTC midnight. */
export function dailyDate(day: number): Date {
  return addUTCDays(DAILY_FIRST_DAY, day - 1);
}

/** "Friday, November 13" for question `day`. */
export function dailyDateLabel(day: number): string {
  return dailyDate(day).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
}
