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

export type PlanId = "monthly" | "sixmonth";

const PRICE_ENV_VARS: Record<PlanId, string> = {
  monthly: "STRIPE_PRICE_ID_MONTHLY",
  sixmonth: "STRIPE_PRICE_ID_SIXMONTH",
};

// The two Prices configured in the Stripe Dashboard, both under one
// Product -- looked up lazily (not read at module load) so importing this
// file for the `stripe` client alone never fails just because one price
// env var happens to be unset. Monthly is a recurring subscription Price
// (7-day trial applied at checkout time, since Stripe's trial mechanic
// only exists for subscriptions); the pass ("Full Course Access", plan id
// and env var still named "sixmonth" from when it was a 6-month pass -- the
// id is internal and renaming it would mean renaming the deployed env var)
// is a one-time Price with no trial. (An old Annual subscription price
// exists in the sandbox but is deactivated -- the one-time pass is the
// yearly option.)
export function getPriceId(plan: PlanId): string {
  const envVar = PRICE_ENV_VARS[plan];
  const value = process.env[envVar];
  if (!value) {
    throw new Error(`${envVar} is not set. Add it to your .env file (see .env.example).`);
  }
  return value;
}

// How long the one-time pass (1 year of access) grants access for, from the moment
// payment completes -- kept here (not just in the Stripe Price's own
// metadata) since app code needs it as a plain number for the
// accessExpiresAt calculation in the webhook handler.
export const PASS_DAYS = 365;

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
