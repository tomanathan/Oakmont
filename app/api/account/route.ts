import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { SESSION_COOKIE_NAME } from "@/lib/auth";
import { ALL_DOMAINS, ALL_SUBSKILLS } from "@/data/curriculum";
import { computeDomainMastery, totalStars, type ProgressMap } from "@/lib/mastery";
import { isCostumeUnlocked } from "@/lib/costumes";

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
    const [progressRows, latestTest] = await Promise.all([
      prisma.progress.findMany({ where: { userId: user.userId } }),
      prisma.practiceTest.findFirst({ where: { userId: user.userId }, orderBy: { takenAt: "desc" } }),
    ]);
    const progress: ProgressMap = {};
    for (const row of progressRows) progress[row.subskillId] = { bestScore: row.bestScore, total: row.total };
    const subskillsByDomain: Record<string, string[]> = {};
    for (const s of ALL_SUBSKILLS) (subskillsByDomain[s.domain] ??= []).push(s.id);
    const mastery = computeDomainMastery(
      ALL_DOMAINS,
      subskillsByDomain,
      progress,
      (latestTest?.domainScores as Record<string, number> | null) ?? null
    );
    if (!isCostumeUnlocked(equippedCostume, totalStars(mastery))) {
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
    const d = new Date(targetTestDate);
    if (isNaN(d.getTime())) {
      return NextResponse.json({ error: "Invalid test date." }, { status: 400 });
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
