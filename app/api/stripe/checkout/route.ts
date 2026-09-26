import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { type PlanId } from "@/lib/stripe";
import { APP_URL, createCheckoutUrl } from "@/lib/checkout";

const PLAN_IDS: PlanId[] = ["monthly", "sixmonth"];

// A student choosing their own plan. (A connected parent paying for them
// goes through /api/parent/checkout; both share lib/checkout.ts.)
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  let body: { plan?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const plan = body.plan as PlanId;
  if (!PLAN_IDS.includes(plan)) {
    return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
  }

  const url = await createCheckoutUrl({
    studentId: user.userId,
    plan,
    successUrl: `${APP_URL}/dashboard?checkout=success`,
    cancelUrl: `${APP_URL}/subscribe?checkout=cancelled`,
  });
  if (!url) {
    return NextResponse.json({ error: "Couldn't start checkout. Please try again." }, { status: 502 });
  }
  return NextResponse.json({ url });
}
