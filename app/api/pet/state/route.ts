import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { computePetState, isSecondPetUnlocked } from "@/lib/pet";
import { ALL_DOMAINS, ALL_SUBSKILLS } from "@/data/curriculum";
import { computeDomainMastery, completedDomainCount, domainWeaknessScore, type ProgressMap } from "@/lib/mastery";
import { isCostumeUnlocked, bestUnlockedCostume } from "@/lib/costumes";
import { daysUntilTest } from "@/lib/pacing";

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
        longestStreak: true,
        equippedCostume: true,
        targetTestDate: true,
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

  const unlockProgress = { domainsCompleted: sectionsCompleted, longestStreak: stats.longestStreak };

  // Re-validate the saved pick is still unlocked rather than trusting it
  // forever, falling back to the best costume still earned.
  const costume =
    stats.equippedCostume && isCostumeUnlocked(stats.equippedCostume, unlockProgress)
      ? stats.equippedCostume
      : bestUnlockedCostume(unlockProgress).id;

  // A single "fully quizzed to a perfect score" count -- the same bar
  // isDomainComplete uses per-domain, just tallied per-subskill instead, so
  // Ozho's own mastery chatter (see components/ScoutCompanion.tsx) can cite
  // a real "X of Y" number without needing its own separate definition of
  // "mastered".
  const subskillsMastered = ALL_SUBSKILLS.filter((s) => {
    const p = progress[s.id];
    return !!p && p.bestScore === p.total;
  }).length;

  // The single domain most worth a nudge toward, using the exact same
  // weakness score the study plan itself schedules around (see
  // orderSubskillsByWeakness) -- never a domain with no data at all (that's
  // "unknown", not "weak"), never one already fully completed (nothing to
  // nudge toward), and never one scoring reasonably well already: without
  // that last check, a student's very first quiz -- attempted once,
  // scored perfectly, but not yet enough to complete the whole domain --
  // was the only domain with any score at all and so won every reduce()
  // below by default, getting called out as the "weak spot" for scoring
  // 100%. WEAK_DOMAIN_THRESHOLD keeps this pool silent until a domain's
  // score is actually low enough to be worth mentioning. Null when nothing
  // qualifies: a brand-new account, or one that's doing fine everywhere
  // it's touched so far.
  const WEAK_DOMAIN_THRESHOLD = 75;
  const weakCandidates = mastery.filter(
    (d) => !d.completed && (d.quizPct !== null || d.testPct !== null) && domainWeaknessScore(d) < WEAK_DOMAIN_THRESHOLD
  );
  const weakestDomain =
    weakCandidates.length === 0
      ? null
      : weakCandidates.reduce((worst, d) => (domainWeaknessScore(d) < domainWeaknessScore(worst) ? d : worst)).domain;

  return NextResponse.json({
    stage: state.stage,
    currentStreak: stats.currentStreak,
    costume,
    sectionsCompleted,
    subskillsMastered,
    totalSubskills: ALL_SUBSKILLS.length,
    daysUntilTest: daysUntilTest(stats.targetTestDate ?? null),
    weakestDomain,
    // Mochi (the second companion) reads this to decide whether to render
    // at all -- see components/SecondCompanion.tsx.
    mochiUnlocked: isSecondPetUnlocked(stats.longestStreak),
  });
}
