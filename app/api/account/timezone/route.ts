import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isJsonRequest } from "@/lib/rateLimit";
import { isValidTimeZone, MAX_TIME_ZONE_LENGTH } from "@/lib/timeZone";

// The student's browser reports its time zone here (see AppShell) whenever
// it differs from the one stored: Google signups and older accounts have
// none yet, and a student who travels moves. Their days -- the streak,
// Ozho, today's plan -- are counted in it (see localDay in lib/dateOnly.ts).
export async function POST(req: NextRequest) {
  if (!isJsonRequest(req)) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { timeZone?: unknown };
  const timeZone = body.timeZone;
  if (typeof timeZone !== "string" || timeZone.length > MAX_TIME_ZONE_LENGTH || !isValidTimeZone(timeZone)) {
    return NextResponse.json({ error: "Unknown time zone." }, { status: 400 });
  }

  // Only written when it actually changed. The null case is spelled out:
  // SQL's "not equal" never matches a missing value.
  const updated = await prisma.user.updateMany({
    where: { id: user.userId, OR: [{ timeZone: null }, { timeZone: { not: timeZone } }] },
    data: { timeZone },
  });
  return NextResponse.json({ ok: true, changed: updated.count > 0 });
}
