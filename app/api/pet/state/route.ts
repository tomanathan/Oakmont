import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { computePetState } from "@/lib/pet";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const stats = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { lastActiveDate: true, petDiedAt: true, petBornAt: true, currentStreak: true },
  });
  if (!stats) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const state = computePetState(stats.lastActiveDate, stats.petDiedAt, stats.petBornAt);
  return NextResponse.json({ stage: state.stage, currentStreak: stats.currentStreak });
}
