// Pure functions for the study-streak pet: a small companion that stays
// happy as long as the student keeps completing quizzes, and dies if they
// go a full week without one. Kept separate from the UI and the cron route
// so the rules are easy to see and test in one place.

export const PET_NAME = "Scout";
export const PET_DEATH_DAYS = 7;
export const PET_WARNING_DAYS = 5;

export type PetStage = "thriving" | "content" | "hungry" | "critical" | "dead";

export interface PetState {
  stage: PetStage;
  daysInactive: number;
  message: string;
}

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function daysBetween(from: Date, to: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((startOfDay(to).getTime() - startOfDay(from).getTime()) / msPerDay);
}

// Starting a new pet is itself a fresh start: its hunger clock should never
// run on quiz activity from before it was born, or reviving after a long
// absence would produce an already-starving "new" pet.
function referenceDate(lastActiveDate: Date | null, petBornAt: Date): Date {
  return lastActiveDate && lastActiveDate > petBornAt ? lastActiveDate : petBornAt;
}

/**
 * Computes the pet's current stage from the student's last quiz-completion
 * date. `petDiedAt` being set always wins -- once dead, the pet stays dead
 * (it doesn't auto-revive just because time has passed or the student is
 * active again), until the student explicitly starts a new one.
 */
export function computePetState(
  lastActiveDate: Date | null,
  petDiedAt: Date | null,
  petBornAt: Date,
  now: Date = new Date()
): PetState {
  const reference = referenceDate(lastActiveDate, petBornAt);

  if (petDiedAt) {
    return {
      stage: "dead",
      daysInactive: daysBetween(reference, now),
      message: `${PET_NAME} didn't make it — a week with no practice is too long for a study pet. Start a new one whenever you're ready.`,
    };
  }

  const daysInactive = daysBetween(reference, now);
  const hasEverStudied = !!lastActiveDate;

  if (daysInactive <= 0) {
    return {
      stage: "thriving",
      daysInactive,
      message: hasEverStudied
        ? `${PET_NAME} is thriving! Great job studying today.`
        : `${PET_NAME} is happy and waiting. Complete your first quiz to start feeding it.`,
    };
  }
  if (daysInactive <= 1) {
    return { stage: "content", daysInactive, message: `${PET_NAME} is doing well. Complete a quiz today to keep it that way.` };
  }
  if (daysInactive <= 3) {
    return {
      stage: "hungry",
      daysInactive,
      message: `${PET_NAME} is getting hungry — it's been ${daysInactive} days. A quick quiz will perk it right up.`,
    };
  }
  if (daysInactive < PET_DEATH_DAYS) {
    const daysLeft = PET_DEATH_DAYS - daysInactive;
    return {
      stage: "critical",
      daysInactive,
      message: `${PET_NAME} is in trouble! ${daysLeft} day${daysLeft === 1 ? "" : "s"} left before it's gone for good.`,
    };
  }
  return {
    stage: "critical",
    daysInactive,
    message: `${PET_NAME} is on its very last day. Complete a quiz right now to save it.`,
  };
}

/** Whether this student's pet should be marked dead as of `now`. */
export function shouldDie(lastActiveDate: Date | null, petBornAt: Date, petDiedAt: Date | null, now: Date = new Date()): boolean {
  if (petDiedAt) return false;
  return daysBetween(referenceDate(lastActiveDate, petBornAt), now) >= PET_DEATH_DAYS;
}

/** Whether a warning email should go out today (exactly PET_WARNING_DAYS in). */
export function shouldWarn(lastActiveDate: Date | null, petBornAt: Date, petDiedAt: Date | null, now: Date = new Date()): boolean {
  if (petDiedAt) return false;
  return daysBetween(referenceDate(lastActiveDate, petBornAt), now) === PET_WARNING_DAYS;
}
