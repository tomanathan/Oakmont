import { prisma } from "@/lib/prisma";
import { getUserStats } from "@/lib/user";
import { computePacing, courseLengthDaysForUser, daysUntilTest } from "@/lib/pacing";
import { computeDomainMastery, orderSubskillsByWeakness } from "@/lib/mastery";
import { progressMapFromRows, isPassed } from "@/lib/progressState";
import { getTodayPlanItem } from "@/lib/studyPlan";
import { ALL_SUBSKILLS, ALL_DOMAINS, buildStudyPlan } from "@/data/curriculum";
import { buildParentReport, type ParentReport } from "@/lib/parentInsights";

// Loads everything a parent report needs for one student and builds it.
// Pace and "this week" are computed exactly as the student's own dashboard
// computes them, so the two never disagree.

const HISTORY_DAYS = 120;
export const DEFAULT_TIME_ZONE = "America/New_York";

export function safeTimeZone(tz: string | null | undefined): string {
  if (!tz) return DEFAULT_TIME_ZONE;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

export function displayName(nickname: string | null | undefined, email: string): string {
  if (nickname && nickname.trim()) return nickname.trim();
  const local = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\d+/g, "").trim();
  if (!local) return "Your student";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export async function loadParentReport(
  studentId: string,
  opts: { name: string; timeZone?: string | null; now?: Date }
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
  const courseLengthDays = courseLengthDaysForUser(createdAt, stats.targetTestDate ?? null);
  const studyPlan = buildStudyPlan(Math.ceil(courseLengthDays / 7), orderSubskillsByWeakness(ALL_SUBSKILLS, domainMastery));
  const planSubskillIds = new Set(studyPlan.flatMap((w) => w.subskillIds));
  const completedInPlan = Object.entries(progress).filter(([id, p]) => planSubskillIds.has(id) && isPassed(p)).length;
  const pacing = computePacing(createdAt, now, planSubskillIds.size, completedInPlan, courseLengthDays);
  const todayItem = getTodayPlanItem(studyPlan, createdAt, now, courseLengthDays);
  const thisWeek = todayItem ? studyPlan.find((w) => w.week === todayItem.week) : null;

  return buildParentReport({
    now,
    timeZone: safeTimeZone(opts.timeZone),
    name: opts.name,
    student: {
      createdAt,
      currentStreak: stats.currentStreak ?? 0,
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
    daysUntilTest: daysUntilTest(stats.targetTestDate ?? null, now),
  });
}
