// Pure functions for the app's gamification layer: mastery detection and the
// daily practice streak. Kept separate from the API route so the rules are
// easy to see and test in one place.

import { utcDayDiff } from "./dateOnly";

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10); // UTC calendar day, e.g. "2026-08-23"
}

// The forgiving streak. A missed day is covered by a banked freeze when there
// is one; if a day or two are still uncovered, finishing two things on the
// day you come back patches them and the old streak returns. Only a longer
// break starts a new chain -- and days studied (what unlocks costumes and
// Mochi) never reset at all. Punishing a break backfires with teens (a
// streak shown as broken lowers engagement on its own), so the way back is
// always short.

export const FREEZE_EVERY_DAYS = 7; // one freeze earned per 7 days in a row
export const FREEZE_CAP = 2; // at most this many banked
export const REPAIR_MAX_MISSED = 2; // uncovered missed days a repair can patch
export const REPAIR_ACTIVITIES = 2; // things to finish on the return day

export interface StreakFields {
  lastActiveDate: Date | null;
  currentStreak: number;
  longestStreak: number;
  daysStudied: number;
  streakFreezes: number;
  activitiesToday: number;
  streakRepairTo: number | null;
  streakRepairDay: Date | null;
}

export interface StreakResult extends Omit<StreakFields, "lastActiveDate"> {
  lastActiveDate: Date;
  freezesUsed: number; // spent on this return to cover missed days
  freezeEarned: boolean;
  repairOffered: boolean; // a repair is now open for today
  repaired: boolean; // this activity completed a repair
}

function freezesEarned(from: number, to: number): number {
  return Math.max(0, Math.floor(to / FREEZE_EVERY_DAYS) - Math.floor(from / FREEZE_EVERY_DAYS));
}

/** Applies one finished activity (lesson, quiz or review) at `now` (UTC days). */
export function advanceStreak(s: StreakFields, now: Date = new Date()): StreakResult {
  const today = dateKey(now);
  let freezes = s.streakFreezes;
  let freezesUsed = 0;
  let repairTo: number | null = null;
  let repairDay: Date | null = null;
  let repairOffered = false;
  let repaired = false;
  let current: number;
  let base: number; // the streak this activity builds on, for earning freezes
  let activitiesToday: number;
  let daysStudied = s.daysStudied;

  if (s.lastActiveDate && dateKey(s.lastActiveDate) === today) {
    // Another activity on a day that already counted.
    activitiesToday = s.activitiesToday + 1;
    base = s.currentStreak;
    current = s.currentStreak;
    const repairOpen = s.streakRepairTo !== null && !!s.streakRepairDay && dateKey(s.streakRepairDay) === today;
    if (repairOpen && activitiesToday >= REPAIR_ACTIVITIES) {
      current = s.streakRepairTo!;
      // The old chain already earned its freezes; only today's step counts.
      base = current - 1;
      repaired = true;
    } else if (repairOpen) {
      repairTo = s.streakRepairTo;
      repairDay = s.streakRepairDay;
    }
  } else {
    // First activity of a new day.
    activitiesToday = 1;
    daysStudied += 1;
    const missed = s.lastActiveDate ? utcDayDiff(s.lastActiveDate, now) - 1 : -1;
    if (missed < 0) {
      base = 0;
      current = 1;
    } else if (missed === 0) {
      base = s.currentStreak;
      current = s.currentStreak + 1;
    } else {
      const used = Math.min(freezes, missed);
      const uncovered = missed - used;
      if (uncovered === 0) {
        // Freezes cover every missed day: the chain carries on through them.
        freezes -= used;
        freezesUsed = used;
        base = s.currentStreak;
        current = s.currentStreak + missed + 1;
      } else if (uncovered <= REPAIR_MAX_MISSED) {
        // A short gap: spend what freezes there are, start today at 1, and
        // offer the repair (one more thing today brings the old chain back).
        freezes -= used;
        freezesUsed = used;
        base = 0;
        current = 1;
        repairTo = s.currentStreak + missed + 1;
        repairDay = now;
        repairOffered = true;
      } else {
        // A real break: a new chain today. Freezes stay banked for next time.
        base = 0;
        current = 1;
      }
    }
  }

  const earned = freezesEarned(base, current);
  freezes = Math.min(FREEZE_CAP, freezes + earned);
  return {
    lastActiveDate: now,
    currentStreak: current,
    longestStreak: Math.max(s.longestStreak, current),
    daysStudied,
    streakFreezes: freezes,
    activitiesToday,
    streakRepairTo: repairTo,
    streakRepairDay: repairDay,
    freezesUsed,
    freezeEarned: earned > 0,
    repairOffered,
    repaired,
  };
}

// Round, memorable numbers worth a bigger celebration than the streak
// badge's usual quiet tick-up -- spaced closer together early on (when
// sticking with it is hardest to prove to yourself) and further apart
// once a streak is already well established.
const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100, 150, 200, 250, 300, 365];

export function isStreakMilestone(streak: number): boolean {
  return STREAK_MILESTONES.includes(streak);
}
