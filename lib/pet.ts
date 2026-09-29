// Pure functions for the study-streak pet: a small companion that stays
// happy as long as the student keeps studying (a finished lesson, quiz, or
// review each count as that day's study). He never dies: a few days away
// makes him hungry, a longer break and he naps until the next session wakes
// him up. Punishing a break backfires with teens (a broken streak lowers
// engagement on its own), so the way back is always one session. Kept
// separate from the UI and the cron route so the rules are easy to see.

import { utcDayDiff } from "./dateOnly";

export const PET_NAME = "Ozho";
// Days away before Ozho naps instead of just being hungry.
export const PET_NAP_DAYS = 4;
// The one gentle "Ozho misses you" email goes out this many days in.
export const PET_NUDGE_DAYS = 5;

// Mochi: a second companion earned at a long daily-practice streak, rather
// than tied to quiz progress at all. Unlike Ozho, Mochi has no hunger clock -- once earned at this streak length, Mochi stays earned
// even if the streak itself later resets to 0, the same "ever achieved"
// philosophy the wardrobe's section-completion costumes already use (see
// lib/costumes.ts) rather than something that can be lost by missing a
// day. 30 is one of lib/gamification.ts's own STREAK_MILESTONES (a full
// month), picked because it's meaningfully bigger than the wardrobe's
// biggest streak-gated costume (14 days, see lib/costumes.ts) -- this is
// the rarer, bigger reward the streak track builds toward.
export const SECOND_PET_NAME = "Mochi";
export const SECOND_PET_UNLOCK_STREAK_DAYS = 30;

export function isSecondPetUnlocked(longestStreak: number): boolean {
  return longestStreak >= SECOND_PET_UNLOCK_STREAK_DAYS;
}

export type PetStage = "thriving" | "content" | "hungry" | "napping";

export interface PetState {
  stage: PetStage;
  daysInactive: number;
  message: string;
}

// The hunger clock starts from whichever is later: the last day of study or
// when this pet started (accounts from before the clock existed start fresh).
function referenceDate(lastActiveDate: Date | null, petBornAt: Date): Date {
  return lastActiveDate && lastActiveDate > petBornAt ? lastActiveDate : petBornAt;
}

/** Ozho's current stage from the student's last day of study. */
export function computePetState(lastActiveDate: Date | null, petBornAt: Date, now: Date = new Date()): PetState {
  const daysInactive = utcDayDiff(referenceDate(lastActiveDate, petBornAt), now);
  const hasEverStudied = !!lastActiveDate;

  if (daysInactive <= 0) {
    return {
      stage: "thriving",
      daysInactive,
      message: hasEverStudied
        ? `${PET_NAME} ate today. Bowl's full.`
        : `${PET_NAME} is waiting. Finish your first lesson or quiz to feed him.`,
    };
  }
  if (daysInactive <= 1) {
    return { stage: "content", daysInactive, message: `${PET_NAME} is doing fine. A lesson or quiz today keeps it that way.` };
  }
  if (daysInactive < PET_NAP_DAYS) {
    return {
      stage: "hungry",
      daysInactive,
      message: `${PET_NAME} is getting hungry. It's been ${daysInactive} days. One lesson or a quick quiz fills the bowl.`,
    };
  }
  return {
    stage: "napping",
    daysInactive,
    message: `${PET_NAME} is napping until you're back. One session wakes him up.`,
  };
}

/** Whether today is the day for the one gentle "Ozho misses you" email. */
export function shouldNudge(lastActiveDate: Date | null, petBornAt: Date, now: Date = new Date()): boolean {
  return utcDayDiff(referenceDate(lastActiveDate, petBornAt), now) === PET_NUDGE_DAYS;
}
