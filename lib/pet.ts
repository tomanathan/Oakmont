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

// Mochi: a second companion who moves in after 30 days of study (days
// studied, which never reset -- see lib/gamification.ts). Unlike Ozho, Mochi
// has no hunger clock. 30 is well past the biggest days-studied costume (14,
// see lib/costumes.ts), so this is the rarer, bigger reward.
export const SECOND_PET_NAME = "Mochi";
export const SECOND_PET_UNLOCK_DAYS = 30;

export function isSecondPetUnlocked(daysStudied: number): boolean {
  return daysStudied >= SECOND_PET_UNLOCK_DAYS;
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
