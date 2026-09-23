import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { SESSION_COOKIE_NAME } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { ALL_DOMAINS, ALL_SUBSKILLS } from "@/data/curriculum";
import { computeDomainMastery, completedDomainCount } from "@/lib/mastery";
import { progressMapFromRows } from "@/lib/progressState";
import { isCostumeUnlocked } from "@/lib/costumes";
import { parseDateOnly, startOfUTCDay } from "@/lib/dateOnly";

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  let body: {
    baselineScore?: number | null;
    goalScore?: number | null;
    targetTestDate?: string | null;
    equippedCostume?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { baselineScore, goalScore, targetTestDate, equippedCostume } = body;

  if (equippedCostume !== undefined && equippedCostume !== null) {
    const [progressRows, latestTest, streakUser] = await Promise.all([
      prisma.progress.findMany({ where: { userId: user.userId } }),
      prisma.practiceTest.findFirst({ where: { userId: user.userId }, orderBy: { takenAt: "desc" } }),
      prisma.user.findUnique({ where: { id: user.userId }, select: { longestStreak: true } }),
    ]);
    const progress = progressMapFromRows(progressRows);
    const subskillsByDomain: Record<string, string[]> = {};
    for (const s of ALL_SUBSKILLS) (subskillsByDomain[s.domain] ??= []).push(s.id);
    const mastery = computeDomainMastery(
      ALL_DOMAINS,
      subskillsByDomain,
      progress,
      (latestTest?.domainScores as Record<string, number> | null) ?? null
    );
    const unlockProgress = { domainsCompleted: completedDomainCount(mastery), longestStreak: streakUser?.longestStreak ?? 0 };
    if (!isCostumeUnlocked(equippedCostume, unlockProgress)) {
      return NextResponse.json({ error: "That costume isn't unlocked yet." }, { status: 400 });
    }
  }

  for (const [label, score] of [
    ["Baseline score", baselineScore],
    ["Goal score", goalScore],
  ] as const) {
    if (score !== null && score !== undefined && (typeof score !== "number" || score < 400 || score > 1600)) {
      return NextResponse.json({ error: `${label} must be between 400 and 1600.` }, { status: 400 });
    }
  }

  let parsedDate: Date | null | undefined = undefined;
  if (targetTestDate === null) {
    parsedDate = null;
  } else if (targetTestDate) {
    // parseDateOnly (not `new Date`) so a full datetime string can't sneak
    // a time-of-day component into a value that's supposed to be a plain
    // calendar day -- see lib/dateOnly.ts.
    const d = parseDateOnly(targetTestDate);
    if (!d) {
      return NextResponse.json({ error: "Invalid test date." }, { status: 400 });
    }
    if (d.getTime() < startOfUTCDay(new Date()).getTime()) {
      return NextResponse.json({ error: "Test date can't be in the past." }, { status: 400 });
    }
    parsedDate = d;
  }

  const updated = await prisma.user.update({
    where: { id: user.userId },
    data: {
      ...(baselineScore !== undefined ? { baselineScore } : {}),
      ...(goalScore !== undefined ? { goalScore } : {}),
      ...(parsedDate !== undefined ? { targetTestDate: parsedDate } : {}),
      ...(equippedCostume !== undefined ? { equippedCostume } : {}),
    },
    select: { baselineScore: true, goalScore: true, targetTestDate: true, equippedCostume: true },
  });

  return NextResponse.json({ ok: true, ...updated });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  // Cancel any live Stripe subscription *before* the row that references it
  // disappears -- deleting the account first would leave a subscription with
  // no way back to the student who's still being charged for it every
  // month. Immediate cancellation (not at period end): the student is
  // leaving entirely, not just downgrading. A one-time 6-Month Pass has no
  // subscription object at all, so most deletions hit the early return
  // below and never call Stripe.
  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { stripeSubscriptionId: true },
  });
  if (dbUser?.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.cancel(dbUser.stripeSubscriptionId);
    } catch {
      // Already canceled, already expired, or Stripe is briefly unreachable
      // -- none of that should block the student from deleting their own
      // account, so this is deliberately swallowed rather than surfaced.
    }
  }

  await prisma.user.delete({ where: { id: user.userId } });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
