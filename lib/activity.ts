import type { Progress } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ALL_DOMAINS, ALL_SUBSKILLS } from "@/data/curriculum";
import { advanceStreak, isStreakMilestone } from "@/lib/gamification";
import { computeDomainMastery, completedDomainCount, isSectionComplete, isCurriculumComplete } from "@/lib/mastery";
import { progressMapFromRows } from "@/lib/progressState";
import { bestUnlockedCostume } from "@/lib/costumes";
import { isSecondPetUnlocked } from "@/lib/pet";
import type { GradedItem } from "@/lib/items";

// What a finished quiz or mixed review changed beyond its own score -- the
// streak, domains and sections newly completed, outfits unlocked, Mochi --
// worked out the same way for both, from the progress rows before and
// after the submission was saved.

const SUBSKILLS_BY_DOMAIN: Record<string, string[]> = {};
for (const s of ALL_SUBSKILLS) (SUBSKILLS_BY_DOMAIN[s.domain] ??= []).push(s.id);

export interface ActivityOutcome {
  currentStreak: number;
  longestStreak: number;
  daysStudied: number;
  streakFreezes: number;
  freezesUsed: number;
  freezeEarned: boolean;
  repairOffered: boolean;
  streakRepaired: boolean;
  streakMilestone: boolean;
  justCompletedDomain: string | null;
  justCompletedSection: string | null;
  justCompletedCurriculum: boolean;
  newCostume: { id: string; name: string } | null;
  secondPetJustUnlocked: boolean;
}

export async function logItemAttempts(userId: string, source: "quiz" | "review", graded: GradedItem[]) {
  if (graded.length === 0) return;
  await prisma.itemAttempt.createMany({
    data: graded.map((g) => ({
      userId,
      subskillId: g.item.subskillId,
      itemId: g.item.id,
      source,
      correct: g.correct,
      choice: g.choice,
      confidence: g.confidence,
      ms: g.ms,
    })),
  });
}

/** Call after the submission's own Progress writes; also updates the streak. */
export async function finishActivity(userId: string, rowsBefore: Progress[]): Promise<ActivityOutcome> {
  const [rowsAfter, dbUser] = await Promise.all([
    prisma.progress.findMany({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);
  const before = computeDomainMastery(ALL_DOMAINS, SUBSKILLS_BY_DOMAIN, progressMapFromRows(rowsBefore), null);
  const after = computeDomainMastery(ALL_DOMAINS, SUBSKILLS_BY_DOMAIN, progressMapFromRows(rowsAfter), null);

  const justCompletedDomain =
    after.find((d) => d.completed && !before.find((b) => b.domain === d.domain)?.completed)?.domain ?? null;
  const sections = Array.from(new Set(ALL_DOMAINS.map((d) => d.section)));
  const justCompletedSection =
    sections.find((sec) => !isSectionComplete(before, sec) && isSectionComplete(after, sec)) ?? null;
  const justCompletedCurriculum = !isCurriculumComplete(before) && isCurriculumComplete(after);

  const streak = advanceStreak({
    lastActiveDate: dbUser?.lastActiveDate ?? null,
    currentStreak: dbUser?.currentStreak ?? 0,
    longestStreak: dbUser?.longestStreak ?? 0,
    daysStudied: dbUser?.daysStudied ?? 0,
    streakFreezes: dbUser?.streakFreezes ?? 1,
    activitiesToday: dbUser?.activitiesToday ?? 0,
    streakRepairTo: dbUser?.streakRepairTo ?? null,
    streakRepairDay: dbUser?.streakRepairDay ?? null,
  });

  // Costumes and Mochi unlock on days studied, which never resets.
  const costumeBefore = bestUnlockedCostume({
    domainsCompleted: completedDomainCount(before),
    daysStudied: dbUser?.daysStudied ?? 0,
  });
  const costumeAfter = bestUnlockedCostume({
    domainsCompleted: completedDomainCount(after),
    daysStudied: streak.daysStudied,
  });
  const newCostume = costumeAfter.id !== costumeBefore.id ? { id: costumeAfter.id, name: costumeAfter.name } : null;

  const secondPetJustUnlocked = !isSecondPetUnlocked(dbUser?.daysStudied ?? 0) && isSecondPetUnlocked(streak.daysStudied);
  const streakMilestone = streak.currentStreak !== (dbUser?.currentStreak ?? 0) && isStreakMilestone(streak.currentStreak);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActiveDate: streak.lastActiveDate,
      daysStudied: streak.daysStudied,
      streakFreezes: streak.streakFreezes,
      activitiesToday: streak.activitiesToday,
      streakRepairTo: streak.streakRepairTo,
      streakRepairDay: streak.streakRepairDay,
      ...(dbUser?.firstStudiedAt ? {} : { firstStudiedAt: streak.lastActiveDate }),
    },
  });

  return {
    currentStreak: updated.currentStreak,
    longestStreak: updated.longestStreak,
    daysStudied: updated.daysStudied,
    streakFreezes: updated.streakFreezes,
    freezesUsed: streak.freezesUsed,
    freezeEarned: streak.freezeEarned,
    repairOffered: streak.repairOffered,
    streakRepaired: streak.repaired,
    streakMilestone,
    justCompletedDomain,
    justCompletedSection,
    justCompletedCurriculum,
    newCostume,
    secondPetJustUnlocked,
  };
}
