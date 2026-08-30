import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { computePetState } from "@/lib/pet";
import { ALL_DOMAINS, ALL_SUBSKILLS } from "@/data/curriculum";
import { computeDomainMastery, completedDomainCount, type ProgressMap } from "@/lib/mastery";
import { isCostumeUnlocked, bestUnlockedCostume } from "@/lib/costumes";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const [stats, progressRows, latestTest] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        lastActiveDate: true,
        petDiedAt: true,
        petBornAt: true,
        currentStreak: true,
        equippedCostume: true,
      },
    }),
    prisma.progress.findMany({ where: { userId: user.userId } }),
    prisma.practiceTest.findFirst({ where: { userId: user.userId }, orderBy: { takenAt: "desc" } }),
  ]);
  if (!stats) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const state = computePetState(stats.lastActiveDate, stats.petDiedAt, stats.petBornAt);

  const progress: ProgressMap = {};
  for (const row of progressRows) progress[row.subskillId] = { bestScore: row.bestScore, total: row.total };
  const subskillsByDomain: Record<string, string[]> = {};
  for (const s of ALL_SUBSKILLS) (subskillsByDomain[s.domain] ??= []).push(s.id);
  const mastery = computeDomainMastery(
    ALL_DOMAINS,
    subskillsByDomain,
    progress,
    (latestTest?.domainScores as Record<string, number> | null) ?? null
  );
  const sectionsCompleted = completedDomainCount(mastery);

  // Re-validate the saved pick is still unlocked rather than trusting it
  // forever, falling back to the best costume still earned.
  const costume =
    stats.equippedCostume && isCostumeUnlocked(stats.equippedCostume, sectionsCompleted)
      ? stats.equippedCostume
      : bestUnlockedCostume(sectionsCompleted).id;

  return NextResponse.json({
    stage: state.stage,
    currentStreak: stats.currentStreak,
    costume,
    sectionsCompleted,
  });
}
