import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserStats } from "@/lib/user";
import { hasActiveAccess } from "@/lib/subscription";
import { stripe, getPriceId, type PlanId } from "@/lib/stripe";
import { BrandMark } from "@/components/BrandMark";
import { SubscribeClient, type PlanOption } from "./SubscribeClient";

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

  return (
    <div className="max-w-[760px] mx-auto px-6 py-12 font-sans">
      <div className="text-center mb-10">
        <BrandMark size={56} className="mx-auto mb-3" />
        <div className="font-display font-semibold text-[28px] text-ink mb-1.5">Choose your plan</div>
        <div className="text-sm text-gray-500 max-w-[520px] mx-auto">
          Every plan includes the full curriculum, all 8 practice tests, your adaptive study plan, and Ozho.
          The monthly plan starts with a 7-day free trial -- your card won't be charged until it ends.
        </div>
      </div>
      <SubscribeClient plans={plans} />
    </div>
  );
}
