// IANA time zone names ("America/Los_Angeles") as stored on a student or a
// parent, checked in one place. Data-free, so client components can use it.

export const DEFAULT_TIME_ZONE = "America/New_York";

// A zone name is short; anything longer is junk, refused before Intl sees it.
export const MAX_TIME_ZONE_LENGTH = 64;

// One formatter per zone: building an Intl.DateTimeFormat is the slow part,
// and the same handful of zones come up again and again. Only zones Intl
// accepted are kept, so junk input can't grow the cache.
const dayFormatters = new Map<string, Intl.DateTimeFormat>();

/**
 * A cached formatter that writes the calendar date in `tz` as numeric
 * year/month/day parts, or null when `tz` isn't a zone Intl knows.
 */
export function zoneDayFormatter(tz: string): Intl.DateTimeFormat | null {
  const cached = dayFormatters.get(tz);
  if (cached) return cached;
  if (!tz || tz.length > MAX_TIME_ZONE_LENGTH) return null;
  try {
    const f = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "numeric", day: "numeric" });
    dayFormatters.set(tz, f);
    return f;
  } catch {
    return null;
  }
}

export function isValidTimeZone(tz: unknown): tz is string {
  return typeof tz === "string" && zoneDayFormatter(tz) !== null;
}

/** A parent's zone, falling back to a sensible default when it's missing or unknown. */
export function safeTimeZone(tz: string | null | undefined): string {
  return isValidTimeZone(tz) ? tz : DEFAULT_TIME_ZONE;
}

/**
 * A student's zone, or null when it's missing or unknown. Null means the
 * student's days are counted in UTC (see localDay in lib/dateOnly.ts) until
 * their browser reports a zone; no default is guessed for them.
 */
export function studentTimeZone(tz: string | null | undefined): string | null {
  return isValidTimeZone(tz) ? tz : null;
}
