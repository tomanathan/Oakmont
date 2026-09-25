// A declined card shouldn't lock out a paying student the moment Stripe's
// automatic retry schedule (Smart Retries) has a bad day -- access is only
// cut off once Stripe itself gives up and the subscription becomes
// "canceled" or "unpaid". "trialing" is here too, obviously: the 7-day
// trial is real access, not a preview.
const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["trialing", "active", "past_due"]);

/**
 * Whether a student currently has paid access, from either purchase path:
 * an active/trialing/past_due subscription (Monthly or Annual), OR an
 * unexpired one-time 1-year pass. A student can hold both -- access is
 * granted if either one is currently valid, not just the first one found.
 */
export function hasActiveAccess(
  subscriptionStatus: string | null,
  accessExpiresAt: Date | null,
  now: Date = new Date()
): boolean {
  const subscriptionActive = !!subscriptionStatus && ACTIVE_SUBSCRIPTION_STATUSES.has(subscriptionStatus);
  const passActive = !!accessExpiresAt && accessExpiresAt.getTime() > now.getTime();
  return subscriptionActive || passActive;
}
