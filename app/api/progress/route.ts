import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getSubskill, ALL_DOMAINS, ALL_SUBSKILLS } from "@/data/curriculum";
import { QUESTIONS } from "@/data/questions";
import { updateStreak, isStreakMilestone } from "@/lib/gamification";
import {
  computeDomainMastery,
  completedDomainCount,
  isSectionComplete,
  isCurriculumComplete,
  type ProgressMap,
} from "@/lib/mastery";
import { bestUnlockedCostume } from "@/lib/costumes";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const rows = await prisma.progress.findMany({ where: { userId: user.userId } });
  const progress: Record<
    string,
    { bestScore: number; total: number; attempts: number; lastAttempt: string }
  > = {};
  for (const row of rows) {
    progress[row.subskillId] = {
      bestScore: row.bestScore,
      total: row.total,
      attempts: row.attempts,
      lastAttempt: row.lastAttempt.toISOString(),
    };
  }
  return NextResponse.json({ progress });
}

const SUBSKILLS_BY_DOMAIN: Record<string, string[]> = {};
for (const s of ALL_SUBSKILLS) (SUBSKILLS_BY_DOMAIN[s.domain] ??= []).push(s.id);

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  let body: { subskillId?: string; score?: number; total?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { subskillId, score } = body;
  const subskill = subskillId ? getSubskill(subskillId) : null;
  if (!subskillId || !subskill) {
    return NextResponse.json({ error: "Unknown subskill." }, { status: 400 });
  }
  // The real question count for this subskill, from the curriculum data --
  // never the client's `total`. Trusting a client-supplied total let a
  // request claim any score against any total (e.g. 999/999), and separately
  // meant a bestScore from one quiz length could get compared against a
  // different one, corrupting mastery -- see the ratio comparison below.
  const realTotal = QUESTIONS[subskillId]?.length ?? 0;
  if (realTotal <= 0) {
    return NextResponse.json({ error: "This subskill has no quiz yet." }, { status: 400 });
  }
  if (typeof score !== "number" || !Number.isInteger(score) || score < 0 || score > realTotal) {
    return NextResponse.json({ error: "Invalid score data." }, { status: 400 });
  }

  // Fetched once and reused both to find this subskill's prior best (below)
  // and to compute domain mastery before/after this submission (further
  // down), rather than querying progress twice.
  const rowsBefore = await prisma.progress.findMany({ where: { userId: user.userId } });
  const existing = rowsBefore.find((r) => r.subskillId === subskillId);

  // Compare by RATIO, not raw score -- a subskill's question count can
  // change between attempts (the question bank grows), and a prior
  // bestScore belongs to whatever total was current *then*. Comparing raw
  // scores across two different totals (e.g. keeping an old "15" against a
  // new quiz's total of 10) used to let bestScore exceed total outright,
  // permanently blocking `bestScore === total` from ever being true again --
  // i.e. the student could never re-master that subskill. bestScore and
  // total are now always written together, from the same attempt.
  const previousRatio = existing ? existing.bestScore / existing.total : 0;
  const newRatio = score / realTotal;
  const thisAttemptIsNewBest = newRatio >= previousRatio;
  const newBest = thisAttemptIsNewBest ? score : existing!.bestScore;
  const bestTotal = thisAttemptIsNewBest ? realTotal : existing!.total;

  const progressResult = existing
    ? await prisma.progress.update({
        where: { userId_subskillId: { userId: user.userId, subskillId } },
        data: {
          bestScore: newBest,
          total: bestTotal,
          attempts: existing.attempts + 1,
          lastAttempt: new Date(),
        },
      })
    : await prisma.progress.create({
        data: { userId: user.userId, subskillId, bestScore: score, total: realTotal, attempts: 1 },
      });

  const wasMastered = previousRatio >= 1;
  const justMastered = !wasMastered && newBest === bestTotal;

  // Did this submission just finish an entire domain ("section" in the
  // dashboard's language) -- every subskill in it now at a perfect score --
  // and did that ripple up into finishing the whole subject it belongs to,
  // or the entire curriculum? Each compared before vs. after this one
  // update rather than just checking the after state, so these only fire
  // on the actual transition, not on every later quiz taken in an
  // already-finished domain/subject. Also whether it pushed the student's
  // completed-domain count into a new wardrobe tier.
  const progressBefore: ProgressMap = {};
  for (const row of rowsBefore) progressBefore[row.subskillId] = { bestScore: row.bestScore, total: row.total };
  const progressAfter: ProgressMap = { ...progressBefore, [subskillId]: { bestScore: newBest, total: bestTotal } };

  const masteryBefore = computeDomainMastery(ALL_DOMAINS, SUBSKILLS_BY_DOMAIN, progressBefore, null);
  const masteryAfter = computeDomainMastery(ALL_DOMAINS, SUBSKILLS_BY_DOMAIN, progressAfter, null);
  const domainBefore = masteryBefore.find((d) => d.domain === subskill.domain);
  const domainAfter = masteryAfter.find((d) => d.domain === subskill.domain);
  const justCompletedDomain = !domainBefore?.completed && domainAfter?.completed ? subskill.domain : null;

  const justCompletedSection =
    !isSectionComplete(masteryBefore, subskill.section) && isSectionComplete(masteryAfter, subskill.section)
      ? subskill.section
      : null;
  const justCompletedCurriculum = !isCurriculumComplete(masteryBefore) && isCurriculumComplete(masteryAfter);

  const costumeBefore = bestUnlockedCostume(completedDomainCount(masteryBefore));
  const costumeAfter = bestUnlockedCostume(completedDomainCount(masteryAfter));
  const newCostume = costumeAfter.id !== costumeBefore.id ? costumeAfter : null;

  const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
  const streak = updateStreak(
    dbUser?.lastActiveDate ?? null,
    dbUser?.currentStreak ?? 0,
    dbUser?.longestStreak ?? 0
  );
  // Only a genuine milestone moment if the streak actually changed today
  // (not a second quiz on a day that already counted), so this can't fire
  // more than once on the day a milestone is actually reached.
  const streakMilestone =
    streak.currentStreak !== (dbUser?.currentStreak ?? 0) && isStreakMilestone(streak.currentStreak);

  const updatedUser = await prisma.user.update({
    where: { id: user.userId },
    data: {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActiveDate: streak.lastActiveDate,
    },
  });

  return NextResponse.json({
    ok: true,
    progress: progressResult,
    justMastered,
    justCompletedDomain,
    justCompletedSection,
    justCompletedCurriculum,
    newCostume: newCostume ? { id: newCostume.id, name: newCostume.name } : null,
    currentStreak: updatedUser.currentStreak,
    longestStreak: updatedUser.longestStreak,
    streakMilestone,
  });
}
