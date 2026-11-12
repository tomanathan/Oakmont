import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { emailParentsAboutPlan } from "@/lib/parentSetup";
import { hasPaidAccess } from "@/lib/subscription";
import { rateLimitAll } from "@/lib/rateLimit";

// "Ask a parent to pay": the student's connected parents get an email that
// opens their dashboard's plan card. Limited per student, since the address
// it goes to is whatever the student entered as their parent's.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  const student = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { subscriptionStatus: true, accessExpiresAt: true },
  });
  if (student && hasPaidAccess(student)) {
    return NextResponse.json({ error: "Your plan is already paid for." }, { status: 400 });
  }
  const allowed = await rateLimitAll([
    [`askpay:${user.userId}`, 1, 10 * 60],
    [`askpay:day:${user.userId}`, 3, 24 * 60 * 60],
  ]);
  if (!allowed) {
    return NextResponse.json({ error: "You've already asked. Give them a little time before asking again." }, { status: 429 });
  }
  const sent = await emailParentsAboutPlan(user.userId, "ask");
  if (sent === 0) return NextResponse.json({ error: "Couldn't reach your parent. Connect with them in Settings first." }, { status: 400 });
  return NextResponse.json({ ok: true, sent });
}
