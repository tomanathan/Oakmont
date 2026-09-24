import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { addParentForStudent } from "@/lib/parentSetup";
import { safeTimeZone } from "@/lib/parentReportData";

const COOLDOWN_MS = 60 * 1000;
const DAILY_LIMIT = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A student adding a parent by email (onboarding and Settings). Creates
// the parent's account if needed, links it, and emails them. Throttled
// per student, since the recipient is whatever address the student typed.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  let body: { email?: string; timeZone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parentEmail = (body.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(parentEmail) || parentEmail.length > 200) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const student = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { email: true, firstName: true, parentInviteEmailedAt: true, parentInviteEmailCount: true },
  });
  if (!student) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  if (parentEmail === student.email.toLowerCase()) {
    return NextResponse.json({ error: "That's your own email. Enter your parent's." }, { status: 400 });
  }

  const now = new Date();
  const last = student.parentInviteEmailedAt;
  const sameDay = !!last && last.toISOString().slice(0, 10) === now.toISOString().slice(0, 10);
  const countToday = sameDay ? student.parentInviteEmailCount : 0;
  if (last && now.getTime() - last.getTime() < COOLDOWN_MS) {
    return NextResponse.json({ error: "Just sent one. Give it a minute before adding another." }, { status: 429 });
  }
  if (countToday >= DAILY_LIMIT) {
    return NextResponse.json({ error: "That's the most for today. Try again tomorrow." }, { status: 429 });
  }

  const result = await addParentForStudent({
    studentId: user.userId,
    studentName: student.firstName ?? "",
    parentEmail,
    timeZone: body.timeZone ? safeTimeZone(body.timeZone) : null,
  });
  await prisma.user.update({
    where: { id: user.userId },
    data: { parentInviteEmailedAt: now, parentInviteEmailCount: countToday + 1, parentOptOutAt: null },
  });
  return NextResponse.json({ ok: true, parent: { id: result.parentId, linkId: result.linkId, email: parentEmail, pending: !result.claimed }, sent: result.sent });
}
