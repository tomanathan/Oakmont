import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { emailParentsAboutPlan } from "@/lib/parentSetup";

// "Ask a parent to pay": the student's connected parents get an email that
// opens their dashboard's plan card.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  const sent = await emailParentsAboutPlan(user.userId, "ask");
  if (sent === 0) return NextResponse.json({ error: "Couldn't reach your parent. Connect with them in Settings first." }, { status: 400 });
  return NextResponse.json({ ok: true, sent });
}
