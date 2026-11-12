import { prisma } from "@/lib/prisma";
import { getUserStats } from "@/lib/user";
import { computePacing, courseLengthDaysForUser, daysUntilTest } from "@/lib/pacing";
import { computeDomainMastery, orderSubskillsByWeakness } from "@/lib/mastery";
import { progressMapFromRows, isPassed } from "@/lib/progressState";
import { getTodayPlanItem } from "@/lib/studyPlan";
import { ALL_SUBSKILLS, ALL_DOMAINS, buildStudyPlan } from "@/data/curriculum";
import { buildParentReport, type ParentReport } from "@/lib/parentInsights";
import { leadWith } from "@/lib/planOrder";
import { liveStreak } from "@/lib/gamification";
import { safeTimeZone } from "@/lib/timeZone";

// Loads everything a parent report needs for one student and builds it.
// Pace and "this week" are computed exactly as the student's own dashboard
// computes them, so the two never disagree.

const HISTORY_DAYS = 120;
// Re-exported for the routes that have always imported them from here.
export { DEFAULT_TIME_ZONE, safeTimeZone } from "@/lib/timeZone";

export function displayName(nickname: string | null | undefined, email: string): string {
  if (nickname && nickname.trim()) return nickname.trim();
  const local = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\d+/g, "").trim();
  if (!local) return "Your student";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export async function loadParentReport(
  studentId: string,
  // completeDays: the Sunday email's week (see ReportOptions in lib/parentInsights.ts).
  opts: { name: string; timeZone?: string | null; now?: Date; completeDays?: boolean }
): Promise<ParentReport> {
  const now = opts.now ?? new Date();
  const since = new Date(now.getTime() - HISTORY_DAYS * 86400000);

  const [rows, stats, tests, attempts, lessonViews] = await Promise.all([
    prisma.progress.findMany({ where: { userId: studentId } }),
    getUserStats(studentId),
    prisma.practiceTest.findMany({ where: { userId: studentId }, orderBy: { takenAt: "desc" } }),
    prisma.itemAttempt.findMany({
      where: { userId: studentId, createdAt: { gte: since } },
      select: { subskillId: true, itemId: true, source: true, correct: true, choice: true, confidence: true, ms: true, createdAt: true },
    }),
    prisma.lessonView.findMany({
      where: { userId: studentId, createdAt: { gte: since } },
      select: { subskillId: true, ms: true, createdAt: true },
    }),
  ]);

  const progress = progressMapFromRows(rows, now);
  const subskillsByDomain: Record<string, string[]> = {};
  for (const s of ALL_SUBSKILLS) (subskillsByDomain[s.domain] ??= []).push(s.id);
  const domainMastery = computeDomainMastery(
    ALL_DOMAINS,
    subskillsByDomain,
    progress,
    (tests[0]?.domainScores as Record<string, number> | null) ?? null
  );

  const createdAt = stats.createdAt ?? now;
  // The student's own days (their zone, not the parent's) for the streak,
  // pace and days to the test, so these match their dashboard.
  const studentTz = stats.timeZone;
  const courseLengthDays = courseLengthDaysForUser(createdAt, stats.targetTestDate ?? null, studentTz);
  const studyPlan = buildStudyPlan(Math.ceil(courseLengthDays / 7), leadWith(orderSubskillsByWeakness(ALL_SUBSKILLS, domainMastery), stats.firstSkillId));
  const planSubskillIds = new Set(studyPlan.flatMap((w) => w.subskillIds));
  const completedInPlan = Object.entries(progress).filter(([id, p]) => planSubskillIds.has(id) && isPassed(p)).length;
  const pacing = computePacing(createdAt, now, studentTz, planSubskillIds.size, completedInPlan, courseLengthDays);
  const todayItem = getTodayPlanItem(studyPlan, createdAt, now, studentTz, courseLengthDays);
  const thisWeek = todayItem ? studyPlan.find((w) => w.week === todayItem.week) : null;

  return buildParentReport({
    now,
    timeZone: safeTimeZone(opts.timeZone),
    name: opts.name,
    student: {
      createdAt,
      // Zero once the streak is no longer alive, so a break never shows
      // next to the streak that ended with it.
      currentStreak: liveStreak(stats.currentStreak ?? 0, stats.lastActiveDate ?? null, now, studentTz),
      longestStreak: stats.longestStreak ?? 0,
      lastActiveDate: stats.lastActiveDate ?? null,
      baselineScore: stats.baselineScore ?? null,
      goalScore: stats.goalScore ?? null,
      targetTestDate: stats.targetTestDate ?? null,
    },
    attempts,
    lessonViews,
    progressRows: rows,
    tests,
    pacing,
    thisWeekPlan: thisWeek
      ? { done: thisWeek.subskillIds.filter((id) => progress[id]).length, total: thisWeek.subskillIds.length }
      : { done: 0, total: 0 },
    daysUntilTest: daysUntilTest(stats.targetTestDate ?? null, now, studentTz),
  }, { completeDays: opts.completeDays });
}
