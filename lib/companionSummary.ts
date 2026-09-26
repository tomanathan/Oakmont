import { computePetState, isSecondPetUnlocked, SECOND_PET_UNLOCK_STREAK_DAYS, PET_DEATH_DAYS, type PetStage } from "./pet";
import { COSTUMES, isCostumeUnlocked, bestUnlockedCostume } from "./costumes";

// Everything the dashboard's Ozho card shows, worked out server-side from
// the same stats the rest of the app already uses (lib/pet.ts for his
// mood, lib/costumes.ts for what's earned and what's next), so the card
// can't disagree with the header pill, Settings, or the quiz's unlocks.
export interface CompanionSummary {
  stage: PetStage;
  daysInactive: number;
  // "Fed" = studied today: a finished lesson, quiz, or review.
  fedToday: boolean;
  hasEverStudied: boolean;
  daysLeft: number;
  costume: string | null;
  currentStreak: number;
  longestStreak: number;
  domainsCompleted: number;
  nextStreakCostume: { id: string; name: string; days: number } | null;
  nextDomainCostume: { id: string; name: string; count: number } | null;
  mochiUnlocked: boolean;
  mochiNeeds: number;
}

export function companionSummary(input: {
  lastActiveDate: Date | null;
  petDiedAt: Date | null;
  petBornAt: Date;
  currentStreak: number;
  longestStreak: number;
  equippedCostume: string | null;
  domainsCompleted: number;
}): CompanionSummary {
  const state = computePetState(input.lastActiveDate, input.petDiedAt, input.petBornAt);
  const unlock = { domainsCompleted: input.domainsCompleted, longestStreak: input.longestStreak };
  const costume =
    input.equippedCostume && isCostumeUnlocked(input.equippedCostume, unlock)
      ? input.equippedCostume
      : bestUnlockedCostume(unlock).id;

  let nextStreakCostume: CompanionSummary["nextStreakCostume"] = null;
  let nextDomainCostume: CompanionSummary["nextDomainCostume"] = null;
  for (const c of COSTUMES) {
    const r = c.requirement;
    if (!nextStreakCostume && r.type === "streak" && input.longestStreak < r.days)
      nextStreakCostume = { id: c.id, name: c.name, days: r.days };
    if (!nextDomainCostume && r.type === "domains" && input.domainsCompleted < r.count)
      nextDomainCostume = { id: c.id, name: c.name, count: r.count };
  }

  return {
    stage: state.stage,
    daysInactive: state.daysInactive,
    fedToday: !!input.lastActiveDate && state.daysInactive <= 0 && state.stage !== "dead",
    hasEverStudied: !!input.lastActiveDate,
    daysLeft: Math.max(0, PET_DEATH_DAYS - state.daysInactive),
    costume: costume === "none" ? null : costume,
    currentStreak: input.currentStreak,
    longestStreak: input.longestStreak,
    domainsCompleted: input.domainsCompleted,
    nextStreakCostume,
    nextDomainCostume,
    mochiUnlocked: isSecondPetUnlocked(input.longestStreak),
    mochiNeeds: SECOND_PET_UNLOCK_STREAK_DAYS,
  };
}
