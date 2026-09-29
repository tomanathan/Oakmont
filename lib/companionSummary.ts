import { computePetState, isSecondPetUnlocked, SECOND_PET_UNLOCK_DAYS, type PetStage } from "./pet";
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
  costume: string | null;
  currentStreak: number;
  longestStreak: number;
  daysStudied: number;
  streakFreezes: number;
  // Came back after a short gap: one more thing today brings the old chain back.
  repairOpen: boolean;
  repairTo: number | null;
  domainsCompleted: number;
  nextDaysCostume: { id: string; name: string; days: number } | null;
  nextDomainCostume: { id: string; name: string; count: number } | null;
  mochiUnlocked: boolean;
  mochiNeeds: number;
}

export function companionSummary(input: {
  lastActiveDate: Date | null;
  petBornAt: Date;
  currentStreak: number;
  longestStreak: number;
  daysStudied: number;
  streakFreezes: number;
  streakRepairTo: number | null;
  streakRepairDay: Date | null;
  equippedCostume: string | null;
  domainsCompleted: number;
}, now: Date = new Date()): CompanionSummary {
  const state = computePetState(input.lastActiveDate, input.petBornAt);
  const repairOpen =
    input.streakRepairTo !== null &&
    !!input.streakRepairDay &&
    input.streakRepairDay.toISOString().slice(0, 10) === now.toISOString().slice(0, 10);
  const unlock = { domainsCompleted: input.domainsCompleted, daysStudied: input.daysStudied };
  const costume =
    input.equippedCostume && isCostumeUnlocked(input.equippedCostume, unlock)
      ? input.equippedCostume
      : bestUnlockedCostume(unlock).id;

  let nextDaysCostume: CompanionSummary["nextDaysCostume"] = null;
  let nextDomainCostume: CompanionSummary["nextDomainCostume"] = null;
  for (const c of COSTUMES) {
    const r = c.requirement;
    if (!nextDaysCostume && r.type === "days" && input.daysStudied < r.days)
      nextDaysCostume = { id: c.id, name: c.name, days: r.days };
    if (!nextDomainCostume && r.type === "domains" && input.domainsCompleted < r.count)
      nextDomainCostume = { id: c.id, name: c.name, count: r.count };
  }

  return {
    stage: state.stage,
    daysInactive: state.daysInactive,
    fedToday: !!input.lastActiveDate && state.daysInactive <= 0,
    hasEverStudied: !!input.lastActiveDate,
    costume: costume === "none" ? null : costume,
    currentStreak: input.currentStreak,
    longestStreak: input.longestStreak,
    daysStudied: input.daysStudied,
    streakFreezes: input.streakFreezes,
    repairOpen,
    repairTo: repairOpen ? input.streakRepairTo : null,
    domainsCompleted: input.domainsCompleted,
    nextDaysCostume,
    nextDomainCostume,
    mochiUnlocked: isSecondPetUnlocked(input.daysStudied),
    mochiNeeds: SECOND_PET_UNLOCK_DAYS,
  };
}
