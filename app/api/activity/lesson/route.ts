import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getSubskill } from "@/data/curriculum";

// Lesson reading time, sent (usually by navigator.sendBeacon) when the
// student leaves a subskill's Lesson tab. Only visible time is counted on
// the client; anything under 10 seconds is dropped as a pass-through.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { subskillId?: unknown; ms?: unknown };
  const subskillId = typeof body.subskillId === "string" ? body.subskillId : "";
  const ms = typeof body.ms === "number" && Number.isFinite(body.ms) ? Math.round(body.ms) : 0;
  if (!getSubskill(subskillId) || ms < 10000) return NextResponse.json({ ok: true, skipped: true });
  await prisma.lessonView.create({ data: { userId: user.userId, subskillId, ms: Math.min(ms, 60 * 60 * 1000) } });
  return NextResponse.json({ ok: true });
}
