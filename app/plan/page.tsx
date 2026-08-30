import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getUserStats } from "@/lib/user";
import { courseLengthDaysForUser, daysUntilTest } from "@/lib/pacing";
import { buildDayPlan } from "@/lib/studyPlan";
import { buildStudyPlan, getSubskill } from "@/data/curriculum";
import { AppShell } from "@/components/AppShell";
import { PlanClient } from "./PlanClient";

export default async function PlanPage() {
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

  const courseStartDate = stats.createdAt ?? new Date();
  const courseLengthDays = courseLengthDaysForUser(courseStartDate, stats.targetTestDate ?? null);
  // Enough whole weeks to cover the exact day count -- the final week is
  // then truncated below so nothing is ever scheduled past the real
  // target date, and nothing before it is left unaccounted for either.
  const totalWeeks = Math.ceil(courseLengthDays / 7);
  const studyPlan = buildStudyPlan(totalWeeks);

  const nameSubskill = (id: string) => {
    const s = getSubskill(id);
    return { id, name: s?.name, section: s?.section, domain: s?.domain };
  };

  const priorSubskillIds: string[] = [];
  const weeksWithNames = studyPlan.map((w, i) => {
    const isLastWeek = i === studyPlan.length - 1;
    const dayCount = isLastWeek ? courseLengthDays - i * 7 : 7;
    const days = buildDayPlan(w, priorSubskillIds, dayCount).map((d) => ({
      ...d,
      subskills: d.subskillIds.map(nameSubskill),
    }));
    priorSubskillIds.push(...w.subskillIds);
    return {
      week: w.week,
      testNumbers: w.testNumbers,
      subskills: w.subskillIds.map(nameSubskill),
      days,
    };
  });

  return (
    <AppShell email={user.email} stats={stats}>
      <PlanClient
        weeks={weeksWithNames}
        progress={progress}
        courseStartDate={courseStartDate.toISOString()}
        targetTestDate={stats.targetTestDate ? stats.targetTestDate.toISOString() : null}
        daysUntilTest={daysUntilTest(stats.targetTestDate ?? null)}
      />
    </AppShell>
  );
}
