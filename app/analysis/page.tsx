import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserStats } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { ALL_DOMAINS, ALL_SUBSKILLS } from "@/data/curriculum";
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

  const progress: Record<string, { bestScore: number; total: number }> = {};
  for (const row of progressRows) {
    progress[row.subskillId] = { bestScore: row.bestScore, total: row.total };
  }

  // Quiz-mastery percentage per domain, from subskill quiz scores, so the
  // page can show it alongside each domain's practice-test subscore.
  const domainQuizPct: Record<string, number | null> = {};
  for (const { domain } of ALL_DOMAINS) {
    const subIds = ALL_SUBSKILLS.filter((s) => s.domain === domain).map((s) => s.id);
    const attempted = subIds.map((id) => progress[id]).filter(Boolean) as {
      bestScore: number;
      total: number;
    }[];
    if (attempted.length === 0) {
      domainQuizPct[domain] = null;
      continue;
    }
    const pct =
      attempted.reduce((acc, p) => acc + p.bestScore / p.total, 0) / attempted.length;
    domainQuizPct[domain] = Math.round(pct * 100);
  }

  return (
    <AppShell email={user.email} stats={stats}>
      <AnalysisClient
        domains={ALL_DOMAINS}
        domainQuizPct={domainQuizPct}
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
