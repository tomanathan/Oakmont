import Stripe from "stripe";

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

export type PlanId = "monthly" | "annual" | "sixmonth";

const PRICE_ENV_VARS: Record<PlanId, string> = {
  monthly: "STRIPE_PRICE_ID_MONTHLY",
  annual: "STRIPE_PRICE_ID_ANNUAL",
  sixmonth: "STRIPE_PRICE_ID_SIXMONTH",
};

// The three Prices configured in the Stripe Dashboard, all under one
// Product -- looked up lazily (not read at module load) so importing this
// file for the `stripe` client alone never fails just because one price
// env var happens to be unset. Monthly and Annual are recurring
// subscription Prices (7-day trial applied at checkout time, since
// Stripe's trial mechanic only exists for subscriptions); SixMonth is a
// one-time Price with no trial.
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
