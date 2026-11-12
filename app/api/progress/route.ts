import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getUserStats } from "@/lib/user";
import { hasActiveAccess } from "@/lib/subscription";
import { getSubskill } from "@/data/curriculum";
import { QUESTIONS } from "@/data/questions";
import { gradeItems } from "@/lib/items";
import { quizSizeFor } from "@/lib/quizSet";
import { finishActivity, logItemAttempts } from "@/lib/activity";
import { progressMapFromRows } from "@/lib/progressState";
import { reviewReady } from "@/lib/reviewSet";

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

// A finished subskill quiz. Each answer is graded here against the bank
// (the client reports which choice it picked, never whether it was right)
// and logged per item; a perfect score marks the subskill passed. Passing
// is the first of two steps to mastered -- see lib/progressState.ts.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }
  const stats = await getUserStats(user.userId);
  if (!hasActiveAccess(stats)) {
    return NextResponse.json({ error: "Your access has expired." }, { status: 402 });
  }

  let body: { subskillId?: string; items?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { subskillId } = body;
  const subskill = subskillId ? getSubskill(subskillId) : null;
  if (!subskillId || !subskill) {
    return NextResponse.json({ error: "Unknown subskill." }, { status: 400 });
  }
  // The real question count, from the bank -- never the client's.
  const realTotal = QUESTIONS[subskillId]?.length ?? 0;
  if (realTotal <= 0) {
    return NextResponse.json({ error: "This subskill has no quiz yet." }, { status: 400 });
  }

  // Every answer of the quiz (a draw from the bank, see lib/quizSet.ts) is
  // graded here. A score reported by the client is never accepted.
  const graded = gradeItems(body.items, subskillId);
  const expected = quizSizeFor(realTotal);
  if (graded.length !== expected) {
    // All the answers arrived but some no longer match a question in the
    // bank: its wording changed after this quiz was drawn (an item's id
    // comes from its text). The page offers a fresh quiz for this.
    if (Array.isArray(body.items) && body.items.length >= expected) {
      return NextResponse.json(
        { error: "This quiz was updated after you started it. Start a fresh one to save your score.", stale: true },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Answer every question before submitting." }, { status: 400 });
  }
  const score = graded.filter((g) => g.correct).length;
  const total = graded.length;

  const rowsBefore = await prisma.progress.findMany({ where: { userId: user.userId } });
  const existing = rowsBefore.find((r) => r.subskillId === subskillId);

  // Best score is compared as a ratio, not a raw count, so a quiz whose
  // length changed since the last attempt can't wedge it.
  const previousRatio = existing ? existing.bestScore / existing.total : 0;
  const thisAttemptIsNewBest = score / total >= previousRatio;
  const perfect = score === total;
  const now = new Date();
  const justPassed = perfect && !existing?.passedAt && !existing?.masteredAt;

  const progressResult = existing
    ? await prisma.progress.update({
        where: { userId_subskillId: { userId: user.userId, subskillId } },
        data: {
          bestScore: thisAttemptIsNewBest ? score : existing.bestScore,
          total: thisAttemptIsNewBest ? total : existing.total,
          attempts: existing.attempts + 1,
          lastAttempt: now,
          ...(justPassed ? { passedAt: now } : {}),
        },
      })
    : await prisma.progress.create({
        data: {
          userId: user.userId,
          subskillId,
          bestScore: score,
          total,
          attempts: 1,
          passedAt: perfect ? now : null,
        },
      });

  await logItemAttempts(user.userId, "quiz", graded);
  const outcome = await finishActivity(user.userId, rowsBefore);

  return NextResponse.json({
    ok: true,
    progress: progressResult,
    score,
    total,
    justPassed,
    alreadyMastered: !!existing?.masteredAt,
    // Whether a mixed review can be built yet (it needs two skills), so the
    // results card only points there once it can.
    reviewReady: reviewReady(
      progressMapFromRows([...rowsBefore.filter((r) => r.subskillId !== subskillId), progressResult])
    ),
    ...outcome,
  });
}
