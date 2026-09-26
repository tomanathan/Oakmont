import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentParent } from "@/lib/parentSession";
import { stripe } from "@/lib/stripe";
import { APP_URL } from "@/lib/checkout";

// Stripe's Billing Portal for a connected student's plan -- so the parent
// who pays can cancel or update the card without the student's login.
export async function POST(req: NextRequest) {
  const parent = await getCurrentParent();
  if (!parent) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { studentId?: unknown };
  const studentId = typeof body.studentId === "string" ? body.studentId : "";
  const link = await prisma.parentLink.findUnique({
    where: { parentId_studentId: { parentId: parent.parentId, studentId } },
    include: { student: { select: { stripeCustomerId: true } } },
  });
  if (!link) return NextResponse.json({ error: "That student isn't connected to your account." }, { status: 403 });
  if (!link.student.stripeCustomerId) return NextResponse.json({ error: "No billing account yet." }, { status: 404 });
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: link.student.stripeCustomerId,
      return_url: `${APP_URL}/parent/dashboard?student=${encodeURIComponent(studentId)}`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Parent billing portal failed:", err);
    return NextResponse.json({ error: "Couldn't open billing. Please try again." }, { status: 502 });
  }
}
