import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getUserStats } from "@/lib/user";
import { hasActiveAccess } from "@/lib/subscription";
import { getSubskill } from "@/data/curriculum";
import { finishActivity } from "@/lib/activity";

// A finished lesson (every question type in it opened -- see SubskillClient)
// counts as a day of study, the same as a finished quiz: it feeds Ozho
// (whose hunger clock runs off lastActiveDate, see lib/pet.ts) and keeps the
// daily streak going. Those two share one date, so a lesson has to advance
// both or a quiz later the same day would see "already studied" and skip
// the streak step. finishActivity does exactly that; with no progress
// written, nothing else it checks (domains, sections) can change.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  const stats = await getUserStats(user.userId);
  if (!hasActiveAccess(stats)) return NextResponse.json({ error: "Your access has expired." }, { status: 402 });

  const body = (await req.json().catch(() => ({}))) as { subskillId?: unknown };
  const subskillId = typeof body.subskillId === "string" ? body.subskillId : "";
  if (!getSubskill(subskillId)) return NextResponse.json({ error: "Unknown subskill." }, { status: 400 });

  // Whether today already counted, so the page only thanks them the first time.
  const today = new Date().toISOString().slice(0, 10);
  const firstToday = !stats.lastActiveDate || stats.lastActiveDate.toISOString().slice(0, 10) !== today;

  const rows = await prisma.progress.findMany({ where: { userId: user.userId } });
  const outcome = await finishActivity(user.userId, rows);
  return NextResponse.json({ ok: true, firstToday, ...outcome });
}
