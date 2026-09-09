import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getUserStats } from "@/lib/user";
import { courseLengthDaysForUser, daysUntilTest } from "@/lib/pacing";
import { buildDayPlan } from "@/lib/studyPlan";
import { computeDomainMastery, orderSubskillsByWeakness, type ProgressMap } from "@/lib/mastery";
import { buildStudyPlan, getSubskill, ALL_DOMAINS, ALL_SUBSKILLS } from "@/data/curriculum";
import { AppShell } from "@/components/AppShell";
import { PlanClient } from "./PlanClient";
import { AnalysisClient } from "./AnalysisClient";

export default async function PlanPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Fetches everything both halves of this page need in one pass: progress
  // for the schedule itself, every logged practice test for the analysis
  // section (history, latest-vs-previous deltas), and stats for the target
  // test date and course start. Practice tests weren't fetched here before
  // this page absorbed what used to be the separate /analysis route.
  const [rows, stats, tests] = await Promise.all([
    prisma.progress.findMany({ where: { userId: user.userId } }),
    getUserStats(user.userId),
    prisma.practiceTest.findMany({ where: { userId: user.userId }, orderBy: { takenAt: "desc" } }),
  ]);
  const progress: ProgressMap = {};
  for (const row of rows) {
    progress[row.subskillId] = { bestScore: row.bestScore, total: row.total };
  }

  const subskillsByDomain: Record<string, string[]> = {};
  for (const s of ALL_SUBSKILLS) (subskillsByDomain[s.domain] ??= []).push(s.id);
  // Same blended-mastery numbers the dashboard and the practice-test
  // breakdown below both show -- computed once here so the schedule below
  // can be ordered by the exact same weakest-domains-first read of a
  // student's performance that the numbers on this page are showing them.
  const domainMastery = computeDomainMastery(
    ALL_DOMAINS,
    subskillsByDomain,
    progress,
    (tests[0]?.domainScores as Record<string, number> | null) ?? null
  );
  const weaknessOrderedIds = orderSubskillsByWeakness(ALL_SUBSKILLS, domainMastery);

  const courseStartDate = stats.createdAt ?? new Date();
  const courseLengthDays = courseLengthDaysForUser(courseStartDate, stats.targetTestDate ?? null);
  // Enough whole weeks to cover the exact day count -- the final week is
  // then truncated below so nothing is ever scheduled past the real
  // target date, and nothing before it is left unaccounted for either.
  const totalWeeks = Math.ceil(courseLengthDays / 7);
  const studyPlan = buildStudyPlan(totalWeeks, weaknessOrderedIds);

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
    <AppShell email={user.email} stats={stats} wide>
      <div className="text-xl font-bold text-ink mb-1.5">Study plan</div>
      <div className="text-sm text-gray-500 mb-6">
        Log a practice test below and the day-by-day schedule further down automatically leans
        more of your remaining time toward whichever domains it shows you're weakest in --
        alongside your quiz mastery, and still paced to finish exactly by your SAT date.
      </div>

      <div id="practice-tests">
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
            domainCounts: t.domainCounts as Record<string, { correct: number; total: number }>,
          }))}
        />
      </div>

      <div className="mt-10">
        <PlanClient
          weeks={weeksWithNames}
          progress={progress}
          courseStartDate={courseStartDate.toISOString()}
          targetTestDate={stats.targetTestDate ? stats.targetTestDate.toISOString() : null}
          daysUntilTest={daysUntilTest(stats.targetTestDate ?? null)}
        />
      </div>
    </AppShell>
  );
}
