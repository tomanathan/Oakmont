import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserStats } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { ALL_DOMAINS, ALL_SUBSKILLS } from "@/data/curriculum";
import { computeDomainMastery, completedDomainCount, type ProgressMap } from "@/lib/mastery";
import { isCostumeUnlocked, bestUnlockedCostume } from "@/lib/costumes";
import { computePetState, PET_NAME } from "@/lib/pet";
import { AppShell } from "@/components/AppShell";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [stats, progressRows] = await Promise.all([
    getUserStats(user.userId),
    prisma.progress.findMany({ where: { userId: user.userId } }),
  ]);

  const progress: ProgressMap = {};
  for (const row of progressRows) progress[row.subskillId] = { bestScore: row.bestScore, total: row.total };
  const subskillsByDomain: Record<string, string[]> = {};
  for (const s of ALL_SUBSKILLS) (subskillsByDomain[s.domain] ??= []).push(s.id);
  // Wardrobe unlocks don't depend on practice-test scores at all, so this
  // page doesn't need to fetch them -- see lib/mastery.ts.
  const mastery = computeDomainMastery(ALL_DOMAINS, subskillsByDomain, progress, null);
  const sectionsCompleted = completedDomainCount(mastery);
  // Same fallback the dashboard and Ozho's own state use: until the
  // student explicitly picks something (including explicitly picking "no
  // costume"), the best costume they've earned is what's shown as worn --
  // so this page always agrees with what Ozho is actually wearing
  // elsewhere in the app.
  const equippedCostume =
    stats.equippedCostume && isCostumeUnlocked(stats.equippedCostume, sectionsCompleted)
      ? stats.equippedCostume
      : bestUnlockedCostume(sectionsCompleted).id;

  const petState = computePetState(stats.lastActiveDate ?? null, stats.petDiedAt ?? null, stats.petBornAt);

  return (
    <AppShell email={user.email} stats={stats}>
      <SettingsClient
        email={user.email}
        baselineScore={stats.baselineScore}
        goalScore={stats.goalScore}
        targetTestDate={stats.targetTestDate ? stats.targetTestDate.toISOString().slice(0, 10) : null}
        sectionsCompleted={sectionsCompleted}
        totalSections={ALL_DOMAINS.length}
        equippedCostume={equippedCostume}
        petName={PET_NAME}
        petState={petState}
      />
    </AppShell>
  );
}
