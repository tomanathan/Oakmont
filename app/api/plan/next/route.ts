import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getUserStats } from "@/lib/user";
import { courseLengthDaysForUser } from "@/lib/pacing";
import { computeDomainMastery, orderSubskillsByWeakness, type ProgressMap } from "@/lib/mastery";
import { getTodayPlanItem } from "@/lib/studyPlan";
import { CURRICULUM, ALL_SUBSKILLS, ALL_DOMAINS, buildStudyPlan, getSubskill } from "@/data/curriculum";
import { findRecommended } from "@/lib/recommend";

// Powers Ozho's "what should I do next?" click action. Mirrors the same
// pipeline the dashboard runs server-side (weakness-ordered plan ->
// today's slot -> first unmastered subskill) so the dog points at exactly
// what the dashboard's "start here" would.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const [rows, stats, latestTest] = await Promise.all([
    prisma.progress.findMany({ where: { userId: user.userId } }),
    getUserStats(user.userId),
    prisma.practiceTest.findFirst({ where: { userId: user.userId }, orderBy: { takenAt: "desc" } }),
  ]);

  const progress: ProgressMap = {};
  for (const row of rows) progress[row.subskillId] = { bestScore: row.bestScore, total: row.total };

  const createdAt = stats.createdAt ?? new Date();
  const courseLengthDays = courseLengthDaysForUser(createdAt, stats.targetTestDate ?? null);

  const subskillsByDomain: Record<string, string[]> = {};
  for (const s of ALL_SUBSKILLS) (subskillsByDomain[s.domain] ??= []).push(s.id);
  const domainMastery = computeDomainMastery(
    ALL_DOMAINS,
    subskillsByDomain,
    progress,
    (latestTest?.domainScores as Record<string, number> | null) ?? null
  );
  const weaknessOrderedIds = orderSubskillsByWeakness(ALL_SUBSKILLS, domainMastery);
  const studyPlan = buildStudyPlan(Math.ceil(courseLengthDays / 7), weaknessOrderedIds);

  const todayItem = getTodayPlanItem(studyPlan, createdAt, new Date(), courseLengthDays);
  const today = todayItem
    ? {
        type: todayItem.day.type,
        testNumber: todayItem.day.testNumber,
        subskills: todayItem.day.subskillIds.map((id) => {
          const s = getSubskill(id);
          return { id, name: s?.name ?? id, domain: s?.domain ?? "" };
        }),
      }
    : null;

  return NextResponse.json({ recommendation: findRecommended(CURRICULUM, progress, today) });
}
