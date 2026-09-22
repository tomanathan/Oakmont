// Upcoming digital SAT administration dates (College Board's 2026-27
// calendar). Kept as one plain array rather than computed, since the actual
// registration calendar isn't published far enough in advance to derive --
// past dates filter out automatically below, so this just needs a yearly
// top-up rather than a rewrite.
export interface SatDate {
  date: string; // ISO yyyy-mm-dd
  label: string;
}

export const SAT_DATES: SatDate[] = [
  { date: "2026-10-03", label: "Oct 3, 2026" },
  { date: "2026-11-07", label: "Nov 7, 2026" },
  { date: "2026-12-05", label: "Dec 5, 2026" },
  { date: "2027-03-06", label: "Mar 6, 2027" },
  { date: "2027-05-01", label: "May 1, 2027" },
  { date: "2027-06-05", label: "Jun 5, 2027" },
];

// Only dates that haven't happened yet -- so this section never goes stale
// mid-season without anyone having to remember to prune it by hand.
export function upcomingSatDates(now: Date = new Date()): SatDate[] {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return SAT_DATES.filter((d) => new Date(`${d.date}T00:00:00Z`).getTime() >= today.getTime());
}

// Whole weeks between now and a given test date -- used to show "N weeks
// until test day," rounded up so a test 6 days out still reads as "1 week,"
// not "0."
export function weeksUntil(dateStr: string, now: Date = new Date()): number {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const target = new Date(`${dateStr}T00:00:00Z`);
  const days = Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  return Math.max(1, Math.ceil(days / 7));
}
