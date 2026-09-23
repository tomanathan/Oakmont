import { prisma } from "@/lib/prisma";
import { getUserStats } from "@/lib/user";
import { computePacing, courseLengthDaysForUser, daysUntilTest } from "@/lib/pacing";
import { computePetState } from "@/lib/pet";
import { computeDomainMastery, orderSubskillsByWeakness } from "@/lib/mastery";
import { progressMapFromRows, isPassed } from "@/lib/progressState";
import { getTodayPlanItem } from "@/lib/studyPlan";
import { CURRICULUM, ALL_SUBSKILLS, ALL_DOMAINS, buildStudyPlan } from "@/data/curriculum";
import { BrandMark } from "@/components/BrandMark";
import { StudentProgressView } from "@/components/StudentProgressView";

// Public, no-login read-only view -- anyone with the link sees this
// student's dashboard, the same as a linked parent account would (see
// app/parent/dashboard/page.tsx, which this mirrors almost exactly, minus
// the parent-account gate and the student switcher). A student generates
// or revokes this link from Settings; a wrong or revoked token gets the
// same generic "not valid" message either way -- never a hint that a
// token was once real, or that any particular token might be close.
export default async function SharePage({ params }: { params: { token: string } }) {
  const student = await prisma.user.findUnique({ where: { parentShareToken: params.token } });

  if (!student) {
    return (
      <div className="max-w-[480px] mx-auto px-6 py-16 font-sans text-center">
        <BrandMark size={48} className="mx-auto mb-4" />
        <div className="text-lg font-semibold text-ink mb-2">This link isn&apos;t valid</div>
        <div className="text-sm text-gray-500">
          It may have been turned off, or the link might be mistyped. Ask your student for a fresh one.
        </div>
      </div>
    );
  }

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

  // Mirrors app/dashboard/page.tsx's own computation exactly -- see
  // app/parent/dashboard/page.tsx's identical block for why.
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
    <div className="max-w-[1180px] mx-auto px-4 pb-12 pt-2 font-sans">
      <header className="flex items-center gap-2.5 py-3 px-4 mb-4">
        <BrandMark size={26} />
        <div className="font-display font-semibold text-[14px] text-ink">Oakmont Study Center</div>
        <span className="text-xs text-gray-400">&middot; shared progress view</span>
      </header>
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
      <div className="text-center text-xs text-gray-400 mt-8">Powered by Oakmont Study Center</div>
    </div>
  );
}
