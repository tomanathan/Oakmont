import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserStats } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { ALL_DOMAINS, ALL_SUBSKILLS } from "@/data/curriculum";
import { computeDomainMastery, totalStars, type ProgressMap } from "@/lib/mastery";
import { isCostumeUnlocked } from "@/lib/costumes";
import { AppShell } from "@/components/AppShell";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [stats, progressRows, latestTest] = await Promise.all([
    getUserStats(user.userId),
    prisma.progress.findMany({ where: { userId: user.userId } }),
    prisma.practiceTest.findFirst({ where: { userId: user.userId }, orderBy: { takenAt: "desc" } }),
  ]);

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
  const stars = totalStars(mastery);
  const equippedCostume =
    stats.equippedCostume && isCostumeUnlocked(stats.equippedCostume, stars) ? stats.equippedCostume : "none";

  return (
    <AppShell email={user.email} stats={stats}>
      <SettingsClient
        email={user.email}
        baselineScore={stats.baselineScore}
        goalScore={stats.goalScore}
        targetTestDate={stats.targetTestDate ? stats.targetTestDate.toISOString().slice(0, 10) : null}
        stars={stars}
        equippedCostume={equippedCostume}
      />
    </AppShell>
  );
}
