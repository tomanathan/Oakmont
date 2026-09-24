import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ensureParentInviteCode } from "@/lib/parentCode";
import { parentInviteEmail } from "@/lib/parentInviteEmail";
import { sendEmail } from "@/lib/email";

const COOLDOWN_MS = 60 * 1000;
const DAILY_LIMIT = 5;

// Emails a parent an invite with the student's code (creating one if they
// don't have one yet). Throttled per student, since the recipient is
// whatever address the student typed.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const to = (body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) || to.length > 200) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { email: true, firstName: true, parentInviteEmailedAt: true, parentInviteEmailCount: true },
  });
  if (!dbUser) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }
  if (to === dbUser.email.toLowerCase()) {
    return NextResponse.json({ error: "That's your own email. Enter your parent's." }, { status: 400 });
  }

  const now = new Date();
  const last = dbUser.parentInviteEmailedAt;
  const sameDay = !!last && last.toISOString().slice(0, 10) === now.toISOString().slice(0, 10);
  const countToday = sameDay ? dbUser.parentInviteEmailCount : 0;
  if (last && now.getTime() - last.getTime() < COOLDOWN_MS) {
    return NextResponse.json({ error: "Just sent one. Give it a minute before sending another." }, { status: 429 });
  }
  if (countToday >= DAILY_LIMIT) {
    return NextResponse.json({ error: "That's the most invites for today. Try again tomorrow, or share the code instead." }, { status: 429 });
  }

  const code = await ensureParentInviteCode(user.userId);
  const appUrl = process.env.APP_URL || req.nextUrl.origin;
  const { subject, html } = parentInviteEmail({ appUrl, code, firstName: dbUser.firstName, studentEmail: dbUser.email });
  const { sent } = await sendEmail({ to, subject, html });
  if (!sent) {
    return NextResponse.json({ error: "The email didn't go through. Share the code instead.", code }, { status: 502 });
  }

  await prisma.user.update({
    where: { id: user.userId },
    data: { parentInviteEmailedAt: now, parentInviteEmailCount: countToday + 1 },
  });
  return NextResponse.json({ ok: true, code });
}
