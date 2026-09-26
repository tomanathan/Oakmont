import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readStartCookie, writeStartCookie, starterItems, type StartState } from "@/lib/starter";

// Saves /start progress as the student goes (one answer, the test date, the
// invite they arrived with) into the signed start cookie, so nothing is lost
// if they close the tab or bounce through Google sign-in.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    answer?: { itemId?: unknown; choice?: unknown };
    date?: unknown;
    invite?: unknown;
  };
  const state: StartState = (await readStartCookie(req.cookies.get("oak_start")?.value)) ?? { answers: {} };

  if (body.answer) {
    const item = starterItems().find((i) => i.id === body.answer!.itemId);
    const choice = body.answer.choice;
    if (!item || typeof choice !== "number" || choice < 0 || choice >= item.choices.length) {
      return NextResponse.json({ error: "Unknown question." }, { status: 400 });
    }
    // First answer counts, as on the real test.
    if (state.answers[item.id] === undefined) state.answers[item.id] = choice;
  }
  if (body.date !== undefined) {
    state.date = typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : null;
  }
  if (typeof body.invite === "string" && body.invite.length <= 64) {
    const invite = await prisma.parentInvite.findUnique({ where: { token: body.invite } });
    if (invite && !invite.usedAt && invite.expiresAt > new Date()) state.invite = body.invite;
  }

  const res = NextResponse.json({ ok: true });
  await writeStartCookie(res, state);
  return res;
}
