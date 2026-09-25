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
    select: { email: true, stripeCustomerId: true, trialEndsAt: true },
  });
  if (!dbUser) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  // Reuse the same Stripe Customer across both purchase paths (and across
  // repeat visits to /subscribe) rather than creating a new one every time
  // -- a student who abandons checkout and comes back shouldn't accumulate
  // duplicate Customer objects.
  let customerId = dbUser.stripeCustomerId;
  // A saved customer can be stale -- e.g. one created in test mode, before
  // the switch to live keys, which the live API reports as missing. Check
  // it still exists; if not, start this student over with a fresh one.
  if (customerId) {
    try {
      const existing = await stripe.customers.retrieve(customerId);
      if ((existing as { deleted?: boolean }).deleted) customerId = null;
    } catch (err) {
      // Only "no such customer" means stale; anything else (a network blip)
      // should fail the request rather than quietly create a duplicate.
      if ((err as { code?: string }).code !== "resource_missing") throw err;
      customerId = null;
    }
  }
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: dbUser.email,
      metadata: { userId: user.userId },
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: user.userId }, data: { stripeCustomerId: customerId } });
  }

  const isSubscription = plan === "monthly";

  // Choosing a plan during the free week shouldn't cost the rest of it:
  // monthly billing starts when the week ends (as a Stripe trial, so the
  // card is saved now and charged then). Stripe needs a trial end at least
  // 48 hours out, so on the last day or two the student simply gets a
  // little extra. After the free week, billing starts right away. The
  // 6-month pass handles the same thing on the webhook side.
  const now = Date.now();
  const trialEnd =
    isSubscription && dbUser.trialEndsAt && dbUser.trialEndsAt.getTime() > now
      ? Math.floor(Math.max(dbUser.trialEndsAt.getTime(), now + 49 * 60 * 60 * 1000) / 1000)
      : null;

  const session = await stripe.checkout.sessions.create({
    mode: isSubscription ? "subscription" : "payment",
    customer: customerId,
    line_items: [{ price: getPriceId(plan), quantity: 1 }],
    client_reference_id: user.userId,
    success_url: `${APP_URL}/dashboard?checkout=success`,
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
      ? { subscription_data: { metadata: { userId: user.userId }, ...(trialEnd ? { trial_end: trialEnd } : {}) } }
      : { metadata: { userId: user.userId, plan } }),
  });

  if (!session.url) {
    return NextResponse.json({ error: "Couldn't start checkout. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ url: session.url });
}
