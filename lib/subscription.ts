// A declined card shouldn't lock out a paying student the moment Stripe's
// automatic retry schedule (Smart Retries) has a bad day -- access is only
// cut off once Stripe itself gives up and the subscription becomes
// "canceled" or "unpaid". "trialing" counts too: a student who picks the
// monthly plan during their free week has a Stripe trial running until
// that week ends, with a card on file.
const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["trialing", "active", "past_due"]);

// Every account starts with this many days of full access, no card needed.
export const TRIAL_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export function trialEndFrom(signup: Date): Date {
  return new Date(signup.getTime() + TRIAL_DAYS * DAY_MS);
}

export interface AccessFields {
  subscriptionStatus: string | null;
  accessExpiresAt: Date | null;
  trialEndsAt?: Date | null;
}

/**
 * Whether a student has paid: an active/trialing/past_due subscription
 * (Monthly), OR an unexpired one-time 6-Month Pass. A student can hold
 * both -- either one being valid is enough.
 */
export function hasPaidAccess(a: AccessFields, now: Date = new Date()): boolean {
  const subscriptionActive = !!a.subscriptionStatus && ACTIVE_SUBSCRIPTION_STATUSES.has(a.subscriptionStatus);
  const passActive = !!a.accessExpiresAt && a.accessExpiresAt.getTime() > now.getTime();
  return subscriptionActive || passActive;
}

/** In the no-card free week and hasn't paid yet. */
export function inFreeTrial(a: AccessFields, now: Date = new Date()): boolean {
  return !hasPaidAccess(a, now) && !!a.trialEndsAt && a.trialEndsAt.getTime() > now.getTime();
}

/** Whether a student can use the course right now: paid, or in the free week. */
export function hasActiveAccess(a: AccessFields, now: Date = new Date()): boolean {
  return hasPaidAccess(a, now) || inFreeTrial(a, now);
}

/** Whole days left in the free week (1 on its last day), or null when not in it. */
export function trialDaysLeft(a: AccessFields, now: Date = new Date()): number | null {
  if (!inFreeTrial(a, now)) return null;
  return Math.max(1, Math.ceil((a.trialEndsAt!.getTime() - now.getTime()) / DAY_MS));
}

/** Free week used up without choosing a plan. */
export function trialEnded(a: AccessFields, now: Date = new Date()): boolean {
  return !hasPaidAccess(a, now) && !!a.trialEndsAt && a.trialEndsAt.getTime() <= now.getTime();
}
