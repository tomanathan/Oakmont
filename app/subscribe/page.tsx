import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserStats } from "@/lib/user";
import { hasActiveAccess } from "@/lib/subscription";
import { stripe, getPriceId, type PlanId } from "@/lib/stripe";
import { BrandMark } from "@/components/BrandMark";
import { LegalFooter } from "@/components/LegalFooter";
import { courseLengthDaysForUser } from "@/lib/pacing";
import { SubscribeClient, type PlanOption } from "./SubscribeClient";
import { retakeState } from "@/lib/retakeCover";
import { RetakeCover } from "@/components/RetakeCover";

export default async function SubscribePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Already paid (or in an active trial) -- nothing to sell them, and
  // showing a pricing page to someone who already has access reads as
  // broken, not just redundant.
  const stats = await getUserStats(user.userId);
  if (hasActiveAccess(stats.subscriptionStatus, stats.accessExpiresAt)) {
    redirect("/dashboard");
  }

  // Fetched live from Stripe, not hardcoded, so the amount shown here can
  // never drift from what Checkout will actually charge.
  const planIds: PlanId[] = ["monthly", "sixmonth"];
  const prices = await Promise.all(planIds.map((id) => stripe.prices.retrieve(getPriceId(id))));
  const plans: PlanOption[] = prices.map((p, i) => ({
    id: planIds[i],
    amountCents: p.unit_amount ?? 0,
    currency: p.currency,
    interval: p.recurring?.interval ?? null,
  }));

  const retake = retakeState(stats.accessExpiresAt ?? null, stats.passRetakeClaimedAt ?? null);

  // Fresh from onboarding: remind them what they just set up.
  const planWeeks = Math.ceil(courseLengthDaysForUser(stats.createdAt ?? new Date(), stats.targetTestDate ?? null) / 7);
  const planLine = stats.welcomeSeenAt
    ? `${stats.firstName ? `${stats.firstName}, your` : "Your"} ${planWeeks}-week plan${
        stats.goalScore ? ` to ${stats.goalScore}` : ""
      } is ready.`
    : null;

  return (
    <div className="max-w-[760px] mx-auto px-6 py-12 font-sans">
      <div className="text-center mb-10">
        <BrandMark size={56} className="mx-auto mb-3" />
        {planLine && (
          <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full bg-[#eef6f1] px-3.5 py-1.5 text-[13px] font-medium text-[#2f6b4a]">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            {planLine}
          </div>
        )}
        <div className="font-display font-semibold text-[28px] text-ink mb-1.5">Choose your plan</div>
        <div className="text-sm text-stone-500 max-w-[520px] mx-auto">
          Every plan includes the full curriculum, all 8 practice tests, your adaptive study plan, and Ozho.
          The monthly plan starts with a 7-day free trial — your card won't be charged until it ends.
        </div>
      </div>
      {retake.options.length > 0 && (
        // A lapsed 6-month pass with its retake cover unused: offer that
        // first -- they shouldn't have to pay again to keep going.
        <div className="mb-8 rounded-2xl border border-[#c9d8c2] bg-[#eef4ea] p-6">
          <RetakeCover claimedAt={null} accessExpiresAt={null} options={retake.options} after="dashboard" />
        </div>
      )}
      <SubscribeClient plans={plans} />
      <div className="text-center text-xs text-stone-500 mt-6">
        See our <a href="/terms" className="underline hover:text-ink">Terms</a> for full billing and refund
        details.
      </div>
      <LegalFooter className="mt-6" />
    </div>
  );
}
