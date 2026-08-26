import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getUserStats } from "@/lib/user";
import { computePacing, courseLengthDaysForUser } from "@/lib/pacing";
import { CURRICULUM, ALL_SUBSKILLS, buildStudyPlan } from "@/data/curriculum";
import { AppShell } from "@/components/AppShell";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [rows, stats] = await Promise.all([
    prisma.progress.findMany({ where: { userId: user.userId } }),
    getUserStats(user.userId),
  ]);
  const progress: Record<string, { bestScore: number; total: number }> = {};
  for (const row of rows) {
    progress[row.subskillId] = { bestScore: row.bestScore, total: row.total };
  }
  const createdAt = stats.createdAt ?? new Date();
  const courseLengthDays = courseLengthDaysForUser(createdAt, stats.targetTestDate ?? null);
  const studyPlan = buildStudyPlan(Math.round(courseLengthDays / 7));
  // Pace against the plan's actual scope (the subskills it schedules
  // week-by-week), not the full subskill bank, so the numbers line up with
  // what /plan shows.
  const planSubskillIds = new Set(studyPlan.flatMap((w) => w.subskillIds));
  const completedInPlan = Object.keys(progress).filter((id) => planSubskillIds.has(id)).length;
  const pacing = computePacing(
    createdAt,
    new Date(),
    planSubskillIds.size,
    completedInPlan,
    courseLengthDays
  );

  return (
    <AppShell email={user.email} stats={stats}>
      <DashboardClient
        curriculum={CURRICULUM}
        progress={progress}
        totalSubskills={ALL_SUBSKILLS.length}
        stats={stats}
        pacing={pacing}
      />
    </AppShell>
  );
}
