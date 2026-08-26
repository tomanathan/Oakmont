// Pure functions for the app's gamification layer: mastery detection and the
// daily practice streak. Kept separate from the API route so the rules are
// easy to see and test in one place.

export function justReachedMastery(previousBest: number, newBest: number, total: number): boolean {
  return total > 0 && newBest === total && previousBest !== total;
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10); // UTC calendar day, e.g. "2026-08-23"
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
}

/**
 * Advances the streak based on today's activity relative to the last active
 * calendar day (UTC). Same day: no change. Exactly one day later: streak
 * continues. Any bigger gap (or no prior activity): streak restarts at 1.
 */
export function updateStreak(
  lastActiveDate: Date | null,
  currentStreak: number,
  longestStreak: number,
  now: Date = new Date()
): StreakState {
  if (lastActiveDate) {
    const lastKey = dateKey(lastActiveDate);
    const todayKey = dateKey(now);
    if (lastKey === todayKey) {
      return { currentStreak, longestStreak, lastActiveDate: now };
    }
    const yesterday = new Date(now);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    if (lastKey === dateKey(yesterday)) {
      const next = currentStreak + 1;
      return { currentStreak: next, longestStreak: Math.max(longestStreak, next), lastActiveDate: now };
    }
  }
  return { currentStreak: 1, longestStreak: Math.max(longestStreak, 1), lastActiveDate: now };
}
