import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserStats } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { ALL_DOMAINS, ALL_SUBSKILLS } from "@/data/curriculum";
import { computeDomainMastery, type ProgressMap } from "@/lib/mastery";
import { AppShell } from "@/components/AppShell";
import { AnalysisClient } from "./AnalysisClient";

export default async function AnalysisPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [stats, tests, progressRows] = await Promise.all([
    getUserStats(user.userId),
    prisma.practiceTest.findMany({
      where: { userId: user.userId },
      orderBy: { takenAt: "desc" },
    }),
    prisma.progress.findMany({ where: { userId: user.userId } }),
  ]);

  const progress: ProgressMap = {};
  for (const row of progressRows) {
    progress[row.subskillId] = { bestScore: row.bestScore, total: row.total };
  }

  const subskillsByDomain: Record<string, string[]> = {};
  for (const s of ALL_SUBSKILLS) (subskillsByDomain[s.domain] ??= []).push(s.id);
  // Blends quiz mastery with the latest practice test's domain subscore --
  // the same numbers the dashboard's star ratings use, so logging a test
  // below visibly moves the same mastery everywhere, not just this page.
  const domainMastery = computeDomainMastery(
    ALL_DOMAINS,
    subskillsByDomain,
    progress,
    (tests[0]?.domainScores as Record<string, number> | null) ?? null
  );

  return (
    <AppShell email={user.email} stats={stats}>
      <AnalysisClient
        domains={ALL_DOMAINS}
        domainMastery={domainMastery}
        tests={tests.map((t) => ({
          id: t.id,
          takenAt: t.takenAt.toISOString(),
          compositeScore: t.compositeScore,
          rwScore: t.rwScore,
          mathScore: t.mathScore,
          domainScores: t.domainScores as Record<string, number>,
        }))}
      />
    </AppShell>
  );
}
