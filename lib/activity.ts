import type { Progress } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ALL_DOMAINS, ALL_SUBSKILLS } from "@/data/curriculum";
import { updateStreak, isStreakMilestone } from "@/lib/gamification";
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

  const streak = updateStreak(dbUser?.lastActiveDate ?? null, dbUser?.currentStreak ?? 0, dbUser?.longestStreak ?? 0);

  const costumeBefore = bestUnlockedCostume({
    domainsCompleted: completedDomainCount(before),
    longestStreak: dbUser?.longestStreak ?? 0,
  });
  const costumeAfter = bestUnlockedCostume({
    domainsCompleted: completedDomainCount(after),
    longestStreak: streak.longestStreak,
  });
  const newCostume = costumeAfter.id !== costumeBefore.id ? { id: costumeAfter.id, name: costumeAfter.name } : null;

  const secondPetJustUnlocked =
    !isSecondPetUnlocked(dbUser?.longestStreak ?? 0) && isSecondPetUnlocked(streak.longestStreak);
  const streakMilestone = streak.currentStreak !== (dbUser?.currentStreak ?? 0) && isStreakMilestone(streak.currentStreak);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActiveDate: streak.lastActiveDate,
    },
  });

  return {
    currentStreak: updated.currentStreak,
    longestStreak: updated.longestStreak,
    streakMilestone,
    justCompletedDomain,
    justCompletedSection,
    justCompletedCurriculum,
    newCostume,
    secondPetJustUnlocked,
  };
}
