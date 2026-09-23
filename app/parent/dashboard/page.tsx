import { redirect } from "next/navigation";
import { getCurrentParent } from "@/lib/parentSession";
import { prisma } from "@/lib/prisma";
import { getUserStats } from "@/lib/user";
import { computePacing, courseLengthDaysForUser, daysUntilTest } from "@/lib/pacing";
import { computePetState } from "@/lib/pet";
import { computeDomainMastery, orderSubskillsByWeakness } from "@/lib/mastery";
import { progressMapFromRows, isPassed } from "@/lib/progressState";
import { getTodayPlanItem } from "@/lib/studyPlan";
import { CURRICULUM, ALL_SUBSKILLS, ALL_DOMAINS, buildStudyPlan } from "@/data/curriculum";
import { ParentShell } from "@/components/ParentShell";
import { StudentProgressView } from "@/components/StudentProgressView";

export default async function ParentDashboardPage({
  searchParams,
}: {
  searchParams: { student?: string };
}) {
  const parent = await getCurrentParent();
  if (!parent) redirect("/parent/login");

  const links = await prisma.parentLink.findMany({
    where: { parentId: parent.parentId },
    include: { student: { select: { id: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  // Shouldn't normally happen (signup requires a code to create the first
  // link), but a parent whose only student unlinked them from Settings
  // lands here instead of a broken/empty dashboard.
  if (links.length === 0) {
    return (
      <ParentShell parentEmail={parent.email} students={[]} activeStudentId="">
        <div className="bg-white border border-[#ece9f7] rounded-2xl p-8 text-center">
          <div className="text-lg font-semibold text-ink mb-2">No student linked</div>
          <div className="text-sm text-gray-500">
            Ask your student for their invite code from Settings &rarr; Parent access, then sign up again with it.
          </div>
        </div>
      </ParentShell>
    );
  }

  const requestedId = searchParams.student;
  const activeLink = links.find((l) => l.studentId === requestedId) ?? links[0];
  const student = activeLink.student;

  const [rows, stats, tests] = await Promise.all([
    prisma.progress.findMany({ where: { userId: student.id } }),
    getUserStats(student.id),
    prisma.practiceTest.findMany({ where: { userId: student.id }, orderBy: { takenAt: "desc" } }),
  ]);

  const progress = progressMapFromRows(rows);

  const subskillsByDomain: Record<string, string[]> = {};
  for (const s of ALL_SUBSKILLS) (subskillsByDomain[s.domain] ??= []).push(s.id);
  const domainMastery = computeDomainMastery(
    ALL_DOMAINS,
    subskillsByDomain,
    progress,
    (tests[0]?.domainScores as Record<string, number> | null) ?? null
  );

  // Everything below mirrors app/dashboard/page.tsx's own computation
  // exactly (same weakness ordering, same plan build, same "completed in
  // plan" pacing input) so a parent's numbers always match what their
  // student sees on their own dashboard for the same account.
  const createdAt = stats.createdAt ?? new Date();
  const courseLengthDays = courseLengthDaysForUser(createdAt, stats.targetTestDate ?? null);
  const weaknessOrderedIds = orderSubskillsByWeakness(ALL_SUBSKILLS, domainMastery);
  const studyPlan = buildStudyPlan(Math.ceil(courseLengthDays / 7), weaknessOrderedIds);
  const planSubskillIds = new Set(studyPlan.flatMap((w) => w.subskillIds));
  const completedInPlan = Object.entries(progress).filter(
    ([id, p]) => planSubskillIds.has(id) && isPassed(p)
  ).length;
  const pacing = computePacing(createdAt, new Date(), planSubskillIds.size, completedInPlan, courseLengthDays);

  const todayItem = getTodayPlanItem(studyPlan, createdAt, new Date(), courseLengthDays);
  const thisWeek = todayItem ? studyPlan.find((w) => w.week === todayItem.week) : null;
  const weekDone = thisWeek ? thisWeek.subskillIds.filter((id) => progress[id]).length : 0;
  const weekTotal = thisWeek ? thisWeek.subskillIds.length : 0;

  const petState = computePetState(stats.lastActiveDate ?? null, stats.petDiedAt ?? null, stats.petBornAt);

  return (
    <ParentShell
      parentEmail={parent.email}
      students={links.map((l) => ({ id: l.studentId, email: l.student.email }))}
      activeStudentId={student.id}
    >
      <StudentProgressView
        studentEmail={student.email}
        curriculum={CURRICULUM}
        progress={progress}
        domainMastery={domainMastery}
        domains={ALL_DOMAINS}
        pacing={pacing}
        thisWeek={{ done: weekDone, total: weekTotal }}
        daysUntilTest={daysUntilTest(stats.targetTestDate ?? null)}
        petStage={petState.stage}
        currentStreak={stats.currentStreak}
        tests={tests.map((t) => ({
          id: t.id,
          takenAt: t.takenAt.toISOString(),
          compositeScore: t.compositeScore,
          rwScore: t.rwScore,
          mathScore: t.mathScore,
          domainScores: t.domainScores as Record<string, number>,
          domainCounts: t.domainCounts as Record<string, { correct: number; total: number }>,
        }))}
      />
    </ParentShell>
  );
}
