import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
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
    // Fires for BOTH purchase paths, but only carries something to do for
    // the one-time path -- a subscription's real status comes from the
    // customer.subscription.* events below, which fire independently of
    // (and continue to fire long after) this one.
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "payment") {
        const userId = session.metadata?.userId;
        if (userId) {
          const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
          await prisma.user.update({
            where: { id: userId },
            data: {
              ...(customerId ? { stripeCustomerId: customerId } : {}),
              accessExpiresAt: new Date(Date.now() + SIXMONTH_PASS_DAYS * 24 * 60 * 60 * 1000),
            },
          });
        }
      }
      break;
    }

    // Every write here is just "set current state" -- a duplicate/retried
    // delivery (Stripe does retry) is naturally idempotent, no
    // events-processed table needed.
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      if (userId) {
        const customerId =
          typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
        // This account uses flexible billing mode, where current_period_end
        // lives on the subscription ITEM, not the subscription itself --
        // confirmed against a real test subscription before writing this,
        // since the "classic" top-level field silently doesn't exist here.
        const periodEndUnix = subscription.items.data[0]?.current_period_end;
        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            currentPeriodEnd: periodEndUnix ? new Date(periodEndUnix * 1000) : null,
          },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { subscriptionStatus: "canceled" },
        });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
