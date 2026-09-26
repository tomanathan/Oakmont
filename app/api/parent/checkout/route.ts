import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentParent } from "@/lib/parentSession";
import { type PlanId } from "@/lib/stripe";
import { APP_URL, createCheckoutUrl } from "@/lib/checkout";

const PLAN_IDS: PlanId[] = ["monthly", "sixmonth"];

// A parent paying for a connected student's plan. The purchase belongs to
// the student's account (their access, their subscription); the parent is
// who's billed and receives the receipts.
export async function POST(req: NextRequest) {
  const parent = await getCurrentParent();
  if (!parent) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { studentId?: unknown; plan?: unknown };
  const studentId = typeof body.studentId === "string" ? body.studentId : "";
  const plan = body.plan as PlanId;
  if (!PLAN_IDS.includes(plan)) return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
  const link = await prisma.parentLink.findUnique({ where: { parentId_studentId: { parentId: parent.parentId, studentId } } });
  if (!link) return NextResponse.json({ error: "That student isn't connected to your account." }, { status: 403 });

  const back = `${APP_URL}/parent/dashboard?student=${encodeURIComponent(studentId)}`;
  const url = await createCheckoutUrl({
    studentId,
    plan,
    payerEmail: parent.email,
    paidByParentId: parent.parentId,
    successUrl: `${back}&checkout=success`,
    cancelUrl: back,
  });
  if (!url) return NextResponse.json({ error: "Couldn't start checkout. Please try again." }, { status: 502 });
  return NextResponse.json({ url });
}
