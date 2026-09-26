import { prisma } from "./prisma";
import { stripe, getPriceId, type PlanId } from "./stripe";

export const APP_URL = process.env.APP_URL || "https://oakmontsat.com";

/**
 * Creates a Stripe Checkout session for a student's plan and returns its
 * URL. Used by the student (/api/stripe/checkout) and by a connected parent
 * paying for them (/api/parent/checkout). Either way the purchase belongs to
 * the student's account: one Stripe Customer per student, reused across
 * visits, whose email -- where receipts go -- is set to whoever is paying.
 */
export async function createCheckoutUrl({
  studentId,
  plan,
  payerEmail,
  paidByParentId,
  successUrl,
  cancelUrl,
}: {
  studentId: string;
  plan: PlanId;
  payerEmail?: string;
  paidByParentId?: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string | null> {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { email: true, stripeCustomerId: true, trialEndsAt: true },
  });
  if (!student) return null;

  // A saved customer can be stale -- e.g. one created in test mode, before
  // the switch to live keys, which the live API reports as missing. Check
  // it still exists; if not, start this student over with a fresh one.
  let customerId = student.stripeCustomerId;
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
  const email = payerEmail ?? student.email;
  if (!customerId) {
    const customer = await stripe.customers.create({ email, metadata: { userId: studentId } });
    customerId = customer.id;
    await prisma.user.update({ where: { id: studentId }, data: { stripeCustomerId: customerId } });
  } else if (payerEmail) {
    // A parent paying: receipts and billing emails go to them.
    await stripe.customers.update(customerId, { email: payerEmail });
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
    isSubscription && student.trialEndsAt && student.trialEndsAt.getTime() > now
      ? Math.floor(Math.max(student.trialEndsAt.getTime(), now + 49 * 60 * 60 * 1000) / 1000)
      : null;
  const payer: Record<string, string> = paidByParentId ? { paidByParentId } : {};

  const session = await stripe.checkout.sessions.create({
    mode: isSubscription ? "subscription" : "payment",
    customer: customerId,
    line_items: [{ price: getPriceId(plan), quantity: 1 }],
    client_reference_id: studentId,
    success_url: successUrl,
    cancel_url: cancelUrl,
    // This account has Managed Payments (Stripe acting as merchant of
    // record) on by default -- explicitly off, since we use standard hosted
    // Checkout and haven't set up the tax code Managed Payments requires.
    managed_payments: { enabled: false },
    // Subscriptions carry their own metadata (read by the
    // customer.subscription.* webhook handlers); a one-time payment has no
    // Subscription object, so its userId lives on the Session itself.
    ...(isSubscription
      ? { subscription_data: { metadata: { userId: studentId, ...payer }, ...(trialEnd ? { trial_end: trialEnd } : {}) } }
      : { metadata: { userId: studentId, plan, ...payer } }),
  });
  return session.url;
}
