import Stripe from "stripe";
import { unstable_cache } from "next/cache";

// A single Stripe SDK client, read only server-side (STRIPE_SECRET_KEY is
// never exposed to the browser -- nothing client-side talks to Stripe
// directly; every purchase redirects to a Stripe-hosted page instead).
function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set. Add it to your .env file (see .env.example).");
  }
  return key;
}

export const stripe = new Stripe(getStripeSecretKey());

export type PlanId = "monthly" | "sixmonth";

const PRICE_ENV_VARS: Record<PlanId, string> = {
  monthly: "STRIPE_PRICE_ID_MONTHLY",
  sixmonth: "STRIPE_PRICE_ID_SIXMONTH",
};

// The two Prices configured in the Stripe Dashboard, both under one
// Product -- looked up lazily (not read at module load) so importing this
// file for the `stripe` client alone never fails just because one price
// env var happens to be unset. Monthly is a recurring subscription Price;
// SixMonth ("Full Course Access") is a one-time Price. The free week is
// the app's own (User.trialEndsAt, no card) -- Stripe only sees a trial
// when someone subscribes during it, to delay their first charge. (An Annual price was created and then
// deactivated in the sandbox -- $99/yr undercut the then-$100 six-month pass
// for twice the access, so it was dropped rather than fixed with mismatched
// numbers.)
export function getPriceId(plan: PlanId): string {
  const envVar = PRICE_ENV_VARS[plan];
  const value = process.env[envVar];
  if (!value) {
    throw new Error(`${envVar} is not set. Add it to your .env file (see .env.example).`);
  }
  return value;
}

// How long a one-time 6-Month Pass grants access for, from the moment
// payment completes -- kept here (not just in the Stripe Price's own
// metadata) since app code needs it as a plain number for the
// accessExpiresAt calculation in the webhook handler.
export const SIXMONTH_PASS_DAYS = 182;

// Local dev (via `stripe listen`) and the deployed app (via a Dashboard-
// configured webhook endpoint) each have their OWN signing secret -- see
// .env.example. Looked up lazily, same reasoning as getPriceId above.
export function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set. Add it to your .env file (see .env.example).");
  }
  return secret;
}

export interface PlanPrice {
  amountCents: number;
  currency: string;
  interval: string | null;
}

// What each plan costs, read from Stripe (never hard-coded) but cached for
// an hour: the homepage and /subscribe render per request, and a Stripe
// round trip on every visit was a noticeable part of their load time. A
// price change shows up within the hour. The Price ids are part of the cache
// key, so pointing the env vars at new Prices takes effect on the next deploy.
const loadPlanPrices = unstable_cache(
  async (monthlyId: string, sixmonthId: string): Promise<Record<PlanId, PlanPrice>> => {
    const [monthly, sixmonth] = await Promise.all([stripe.prices.retrieve(monthlyId), stripe.prices.retrieve(sixmonthId)]);
    const shape = (p: Stripe.Price): PlanPrice => ({ amountCents: p.unit_amount ?? 0, currency: p.currency, interval: p.recurring?.interval ?? null });
    return { monthly: shape(monthly), sixmonth: shape(sixmonth) };
  },
  ["stripe-plan-prices"],
  { revalidate: 3600 }
);

export function getPlanPrices(): Promise<Record<PlanId, PlanPrice>> {
  return loadPlanPrices(getPriceId("monthly"), getPriceId("sixmonth"));
}
