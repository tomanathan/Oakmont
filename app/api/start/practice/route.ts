import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { gradeItems } from "@/lib/items";
import { logItemAttempts } from "@/lib/activity";

// The first practice set after /start: graded against the bank and logged
// like quiz answers (so it shows in the parent report and admin numbers),
// without touching skill progress -- five questions isn't a skill quiz.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { items?: unknown; skillId?: unknown };
  const skillId = typeof body.skillId === "string" ? body.skillId : undefined;
  const graded = gradeItems(body.items, skillId);
  await logItemAttempts(user.userId, "quiz", graded);
  return NextResponse.json({ ok: true, correct: graded.filter((g) => g.correct).length, total: graded.length });
}
