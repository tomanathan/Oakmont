import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getUserStats } from "@/lib/user";
import { hasActiveAccess } from "@/lib/subscription";
import { getSubskill } from "@/data/curriculum";
import { gradeItems, paceFor } from "@/lib/items";
import { progressMapFromRows, nextReviewInterval, addDays, FIRST_REVIEW_INTERVAL_DAYS } from "@/lib/progressState";
import { buildReviewSet } from "@/lib/reviewSet";
import { finishActivity, logItemAttempts } from "@/lib/activity";

const HISTORY_DAYS = 120;

async function guard() {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Not logged in." }, { status: 401 }) };
  const stats = await getUserStats(user.userId);
  if (!hasActiveAccess(stats.subscriptionStatus, stats.accessExpiresAt)) {
    return { error: NextResponse.json({ error: "Your access has expired." }, { status: 402 }) };
  }
  return { user };
}

// Today's mixed review set (see lib/reviewSet.ts). Answers and
// explanations stay on the server until the set is submitted.
export async function GET() {
  const g = await guard();
  if (g.error) return g.error;
  const userId = g.user.userId;

  const since = new Date(Date.now() - HISTORY_DAYS * 24 * 60 * 60 * 1000);
  const [rows, attempts] = await Promise.all([
    prisma.progress.findMany({ where: { userId } }),
    prisma.itemAttempt.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { itemId: true, subskillId: true, correct: true, confidence: true, createdAt: true },
    }),
  ]);
  const plan = buildReviewSet(progressMapFromRows(rows), attempts);
  const name = (id: string) => getSubskill(id)?.name ?? id;

  return NextResponse.json({
    items: plan.items.map((it) => ({
      id: it.id,
      q: it.q,
      choices: it.choices,
      underline: it.underline ?? null,
      section: it.section,
      pace: paceFor(it.section),
    })),
    toConfirm: plan.toConfirm.map(name),
    refreshers: plan.refreshers.map(name),
  });
}

// A finished mixed review. Per subskill it touched:
//   - passed, answered correctly (and not a guess): now mastered
//   - mastered and due, all correct: refreshed; next refresher further out
//   - mastered, any miss: flagged due again right away (still mastered)
export async function POST(req: NextRequest) {
  const g = await guard();
  if (g.error) return g.error;
  const userId = g.user.userId;

  let body: { items?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const graded = gradeItems(body.items);
  if (graded.length === 0) {
    return NextResponse.json({ error: "Nothing to submit." }, { status: 400 });
  }

  const rowsBefore = await prisma.progress.findMany({ where: { userId } });
  const now = new Date();
  const bySub = new Map<string, typeof graded>();
  for (const it of graded) bySub.set(it.item.subskillId, [...(bySub.get(it.item.subskillId) ?? []), it]);

  const mastered: string[] = [];
  const refreshed: string[] = [];
  const flagged: string[] = [];
  for (const [subskillId, its] of bySub) {
    const row = rowsBefore.find((r) => r.subskillId === subskillId);
    if (!row) continue;
    const allRight = its.every((i) => i.correct);
    const confidentHit = its.some((i) => i.correct && i.confidence !== "guessed");
    const isPassed = !!row.passedAt || row.bestScore === row.total;

    if (!row.masteredAt) {
      if (isPassed && allRight && confidentHit) {
        await prisma.progress.update({
          where: { id: row.id },
          data: {
            passedAt: row.passedAt ?? now,
            masteredAt: now,
            reviewInterval: FIRST_REVIEW_INTERVAL_DAYS,
            reviewDueAt: addDays(now, FIRST_REVIEW_INTERVAL_DAYS),
          },
        });
        mastered.push(subskillId);
      }
    } else if (!allRight) {
      await prisma.progress.update({
        where: { id: row.id },
        data: { reviewDueAt: now, reviewInterval: FIRST_REVIEW_INTERVAL_DAYS },
      });
      flagged.push(subskillId);
    } else if (confidentHit && row.reviewDueAt && row.reviewDueAt <= now) {
      const interval = nextReviewInterval(row.reviewInterval);
      await prisma.progress.update({
        where: { id: row.id },
        data: { reviewInterval: interval, reviewDueAt: addDays(now, interval) },
      });
      refreshed.push(subskillId);
    }
  }

  await logItemAttempts(userId, "review", graded);
  const outcome = await finishActivity(userId, rowsBefore);
  const named = (id: string) => ({ id, name: getSubskill(id)?.name ?? id });

  return NextResponse.json({
    ok: true,
    results: graded.map((it) => {
      const sub = getSubskill(it.item.subskillId);
      return {
        itemId: it.item.id,
        correct: it.correct,
        choice: it.choice,
        answer: it.item.answer,
        explain: it.item.explain,
        pattern: it.item.pattern ?? null,
        subskillId: it.item.subskillId,
        subskillName: sub?.name ?? it.item.subskillId,
        domain: it.item.domain,
        section: it.item.section,
      };
    }),
    mastered: mastered.map(named),
    refreshed: refreshed.map(named),
    flagged: flagged.map(named),
    ...outcome,
  });
}
