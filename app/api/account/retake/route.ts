import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { retakeState, retakeAccessEnd } from "@/lib/retakeCover";

// Claims the 6-month pass's retake cover: access extends through the chosen
// official SAT date (plus a few days), and the study plan retargets to it.
// Once per account -- the claim is a conditional update on
// passRetakeClaimedAt still being null, so a double click can't claim twice.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { date?: unknown };
  const date = typeof body.date === "string" ? body.date : "";

  const row = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { accessExpiresAt: true, passRetakeClaimedAt: true },
  });
  if (!row) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  const state = retakeState(row.accessExpiresAt, row.passRetakeClaimedAt);
  if (!state.hasPass) return NextResponse.json({ error: "Retake cover comes with the 6-month pass." }, { status: 403 });
  if (state.claimedAt) return NextResponse.json({ error: "You've already used your retake cover." }, { status: 409 });
  if (!state.options.some((d) => d.date === date)) {
    return NextResponse.json({ error: "Pick one of the listed test dates." }, { status: 400 });
  }

  const accessExpiresAt = retakeAccessEnd(date);
  const claimed = await prisma.user.updateMany({
    where: { id: user.userId, passRetakeClaimedAt: null },
    data: {
      accessExpiresAt,
      passRetakeClaimedAt: new Date(),
      targetTestDate: new Date(`${date}T00:00:00Z`),
    },
  });
  if (claimed.count === 0) return NextResponse.json({ error: "You've already used your retake cover." }, { status: 409 });
  return NextResponse.json({ ok: true, accessExpiresAt: accessExpiresAt.toISOString() });
}
