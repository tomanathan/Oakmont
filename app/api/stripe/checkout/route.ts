import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { stripe, getPriceId, type PlanId } from "@/lib/stripe";

const APP_URL = process.env.APP_URL || "https://oakmontsat.com";
const PLAN_IDS: PlanId[] = ["monthly", "sixmonth"];

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

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { email: true, stripeCustomerId: true },
  });
  if (!dbUser) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  // Reuse the same Stripe Customer across both purchase paths (and across
  // repeat visits to /subscribe) rather than creating a new one every time
  // -- a student who abandons checkout and comes back shouldn't accumulate
  // duplicate Customer objects.
  let customerId = dbUser.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: dbUser.email,
      metadata: { userId: user.userId },
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: user.userId }, data: { stripeCustomerId: customerId } });
  }

  const isSubscription = plan === "monthly";

  const session = await stripe.checkout.sessions.create({
    mode: isSubscription ? "subscription" : "payment",
    customer: customerId,
    line_items: [{ price: getPriceId(plan), quantity: 1 }],
    client_reference_id: user.userId,
    success_url: `${APP_URL}/welcome?checkout=success`,
    cancel_url: `${APP_URL}/subscribe?checkout=cancelled`,
    // This account has Managed Payments (Stripe acting as merchant of
    // record, handling tax/compliance) enabled by default -- explicitly
    // off here since we deliberately chose standard hosted Checkout, not
    // Managed Payments, and haven't set up the product tax code Managed
    // Payments requires. Without this, session creation fails outright.
    managed_payments: { enabled: false },
    // Subscriptions carry their own metadata (read by the customer.subscription.*
    // webhook handlers, which are the source of truth for subscription status --
    // see app/api/stripe/webhook/route.ts). A one-time payment has no
    // Subscription object at all, so its userId has to live on the Checkout
    // Session itself instead, which checkout.session.completed does receive.
    ...(isSubscription
      ? { subscription_data: { trial_period_days: 7, metadata: { userId: user.userId } } }
      : { metadata: { userId: user.userId, plan } }),
  });

  if (!session.url) {
    return NextResponse.json({ error: "Couldn't start checkout. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ url: session.url });
}
