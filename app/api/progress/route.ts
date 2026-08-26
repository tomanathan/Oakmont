import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getSubskill } from "@/data/curriculum";
import { MASTERY_BONUS_XP, justReachedMastery, updateStreak, xpForImprovement } from "@/lib/gamification";

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

  const { subskillId, score, total } = body;
  if (!subskillId || !getSubskill(subskillId)) {
    return NextResponse.json({ error: "Unknown subskill." }, { status: 400 });
  }
  if (typeof score !== "number" || typeof total !== "number" || total <= 0 || score < 0 || score > total) {
    return NextResponse.json({ error: "Invalid score data." }, { status: 400 });
  }

  const existing = await prisma.progress.findUnique({
    where: { userId_subskillId: { userId: user.userId, subskillId } },
  });
  const previousBest = existing?.bestScore ?? 0;
  const newBest = Math.max(previousBest, score);

  const progressResult = existing
    ? await prisma.progress.update({
        where: { userId_subskillId: { userId: user.userId, subskillId } },
        data: {
          bestScore: newBest,
          total,
          attempts: existing.attempts + 1,
          lastAttempt: new Date(),
        },
      })
    : await prisma.progress.create({
        data: { userId: user.userId, subskillId, bestScore: score, total, attempts: 1 },
      });

  // Gamification: award XP only for genuine improvement on this subskill's
  // best score (not for re-submitting without doing better), plus a
  // one-time bonus the moment a subskill first reaches a perfect score.
  const justMastered = justReachedMastery(previousBest, newBest, total);
  const xpGained =
    xpForImprovement(previousBest, newBest) + (justMastered ? MASTERY_BONUS_XP : 0);

  const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
  const streak = updateStreak(
    dbUser?.lastActiveDate ?? null,
    dbUser?.currentStreak ?? 0,
    dbUser?.longestStreak ?? 0
  );

  const updatedUser = await prisma.user.update({
    where: { id: user.userId },
    data: {
      totalXP: { increment: xpGained },
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActiveDate: streak.lastActiveDate,
    },
  });

  return NextResponse.json({
    ok: true,
    progress: progressResult,
    xpGained,
    justMastered,
    totalXP: updatedUser.totalXP,
    currentStreak: updatedUser.currentStreak,
    longestStreak: updatedUser.longestStreak,
  });
}
