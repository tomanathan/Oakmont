import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getUserStats } from "@/lib/user";
import { STUDY_PLAN, getSubskill } from "@/data/curriculum";
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

  const weeksWithNames = STUDY_PLAN.map((w) => ({
    ...w,
    subskills: (w.subskillIds ?? []).map((id) => {
      const s = getSubskill(id);
      return { id, name: s?.name, section: s?.section, domain: s?.domain };
    }),
  }));

  return (
    <AppShell email={user.email} stats={stats}>
      <PlanClient weeks={weeksWithNames} progress={progress} />
    </AppShell>
  );
}
