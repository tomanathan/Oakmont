import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { stripe, getWebhookSecret, SIXMONTH_PASS_DAYS } from "@/lib/stripe";

// The actual source of truth for access -- not the browser redirect back
// from Checkout, which only tells you the *customer's browser* reached the
// success URL, not that the payment or subscription is actually valid.
//
// Reads the RAW request body (Next.js App Router route handlers don't
// auto-parse it, so this is naturally correct -- no bodyParser config
// needed, unlike the old Pages Router). Signature verification runs before
// any of the payload is trusted; an unsigned or badly-signed request is
// rejected outright.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, getWebhookSecret());
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  switch (event.type) {
    // Fires for BOTH purchase paths. A one-time pass is granted here; for a
    // subscription this is the first moment it exists, so its state is
    // synced right away rather than waiting on the customer.subscription.*
    // events (which arrive separately, in no guaranteed order).
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "payment") {
        await grantPass(session);
      } else if (session.mode === "subscription" && session.subscription) {
        await syncSubscription(typeof session.subscription === "string" ? session.subscription : session.subscription.id, null);
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncSubscription(subscription.id, subscription);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

const LIVE = new Set(["trialing", "active", "past_due"]);

// The 6-month pass: 182 days added after whatever access the student
// already has. Stripe can deliver the same event more than once, and
// adding days twice would double the pass, so each Checkout Session is
// recorded (StripeGrant) in the same transaction that adds its days and a
// repeat is skipped.
async function grantPass(session: Stripe.Checkout.Session) {
  // A payment method that settles later (a bank debit) completes Checkout
  // unpaid; its days are added when async_payment_succeeded arrives.
  if (session.payment_status === "unpaid") return;
  const userId = session.metadata?.userId;
  const row = userId
    ? await prisma.user.findUnique({ where: { id: userId }, select: { trialEndsAt: true, accessExpiresAt: true, firstPaidAt: true } })
    : null;
  if (!userId || !row) return;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  // The pass's 182 days start after whatever access the student already
  // has -- the rest of their free week, or a pass still running -- so
  // buying early never costs them days.
  const start = Math.max(Date.now(), row.trialEndsAt?.getTime() ?? 0, row.accessExpiresAt?.getTime() ?? 0);
  try {
    await prisma.$transaction([
      prisma.stripeGrant.create({ data: { id: session.id } }),
      prisma.user.update({
        where: { id: userId },
        data: {
          ...(customerId ? { stripeCustomerId: customerId } : {}),
          accessExpiresAt: new Date(start + SIXMONTH_PASS_DAYS * 24 * 60 * 60 * 1000),
          ...(row.firstPaidAt ? {} : { firstPaidAt: new Date() }),
        },
      }),
    ]);
  } catch (err) {
    // Already recorded: this session's days were added by an earlier delivery.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return;
    throw err;
  }
}

// Writes a subscription's current state onto its student. Events can arrive
// late or out of order (an old "updated" after a "deleted"; a first
// subscription's cancellation after a second one has started), so the state
// written is the subscription as Stripe has it now, not as the event
// captured it -- and an ended subscription never overwrites a different one
// that is still running.
async function syncSubscription(subscriptionId: string, fromEvent: Stripe.Subscription | null) {
  let subscription = fromEvent;
  try {
    subscription = await stripe.subscriptions.retrieve(subscriptionId);
  } catch (err) {
    // Couldn't reach Stripe: fall back to the event's own copy if there is
    // one, otherwise fail so Stripe retries the delivery.
    if (!subscription) throw err;
  }
  if (!subscription) return;
  const userId = subscription.metadata?.userId;
  if (!userId) return;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeSubscriptionId: true, subscriptionStatus: true },
  });
  // The account was deleted (which cancels its subscription): nothing to update.
  if (!user) return;

  const live = LIVE.has(subscription.status);
  const otherIsLive =
    !!user.stripeSubscriptionId &&
    user.stripeSubscriptionId !== subscription.id &&
    !!user.subscriptionStatus &&
    LIVE.has(user.subscriptionStatus);
  if (!live && otherIsLive) return;

  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  // This account uses flexible billing mode, where current_period_end
  // lives on the subscription ITEM, not the subscription itself --
  // confirmed against a real test subscription before writing this,
  // since the "classic" top-level field silently doesn't exist here.
  const periodEndUnix = subscription.items.data[0]?.current_period_end ?? fromEvent?.items.data[0]?.current_period_end;
  // First time this student commits to a plan (a monthly subscription
  // starts, even if its first charge waits for the free week to end).
  if (live) {
    await prisma.user.updateMany({ where: { id: userId, firstPaidAt: null }, data: { firstPaidAt: new Date() } });
  }
  // updateMany: a student deleting their account between the lookup above
  // and here must not turn this delivery into an error Stripe keeps retrying.
  await prisma.user.updateMany({
    where: { id: userId },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      currentPeriodEnd: periodEndUnix ? new Date(periodEndUnix * 1000) : null,
    },
  });
}
