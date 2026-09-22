import { stripe, getPriceId, type PlanId } from "@/lib/stripe";
import { TrackedLink } from "./TrackedLink";
import { ViewTracker } from "./ViewTracker";

// Reads the exact same live Stripe Prices /subscribe uses -- one source of
// truth for what things cost, never a second hard-coded number that could
// drift from what Checkout will actually charge.
export async function Pricing() {
  const planIds: PlanId[] = ["sixmonth", "monthly"];
  const prices = await Promise.all(planIds.map((id) => stripe.prices.retrieve(getPriceId(id))));
  const sixmonth = prices[0];
  const monthly = prices[1];

  return (
    <section id="pricing" className="px-6 py-16 sm:py-20 bg-white border-y border-[#ece9f7]">
      <ViewTracker event="pricing_viewed" />
      <div className="max-w-[640px] mx-auto text-center">
        <h2 className="font-display font-semibold text-[26px] sm:text-[30px] text-ink mb-2">Pricing</h2>
        <p className="text-sm text-gray-500 mb-2">
          Self-paced SAT courses typically run a few hundred dollars. Private tutoring runs far more, per hour.
        </p>
        <p className="text-sm text-gray-500 mb-8">This is a tutor&apos;s full plan, priced like neither.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative bg-[#faf8f4] border-2 border-ink rounded-2xl p-6 text-left">
            <div className="absolute -top-3 left-6 bg-ink text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
              Full course access
            </div>
            <div className="mt-2 mb-1 flex items-baseline gap-1.5">
              <span className="text-[32px] leading-none font-display font-semibold text-ink">
                ${((sixmonth.unit_amount ?? 0) / 100).toFixed(0)}
              </span>
              <span className="text-sm text-gray-500">one time</span>
            </div>
            <div className="text-sm text-gray-500">6 months of access. One payment, nothing to cancel.</div>
          </div>
          <div className="bg-[#faf8f4] border border-[#ece9f7] rounded-2xl p-6 text-left">
            <div className="mb-1 flex items-baseline gap-1.5">
              <span className="text-[32px] leading-none font-display font-semibold text-ink">
                ${((monthly.unit_amount ?? 0) / 100).toFixed(0)}
              </span>
              <span className="text-sm text-gray-500">/month</span>
            </div>
            <div className="text-sm text-gray-500">Cancel anytime. Starts with a 7-day free trial.</div>
          </div>
        </div>

        <TrackedLink
          href="/login?mode=signup"
          event="signup_started"
          className="inline-block mt-8 px-6 py-3 rounded-lg bg-ink text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Start free →
        </TrackedLink>

        {/* Folded in from what used to be a standalone "For parents"
            section -- same message, condensed, and landing exactly where a
            parent reader is actually deciding rather than after the ask. */}
        <div className="mt-10 pt-8 border-t border-[#ece9f7] text-left bg-[#faf8f4] rounded-xl p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#4a5bb0] mb-1.5">For parents</div>
          <p className="text-sm text-gray-600 leading-relaxed">
            You can see exactly what your student is studying and how they&apos;re doing, without logging into
            their account. Once they invite you from their own Settings, you get a read-only view of their pace,
            subject mastery, and practice-test history — a real structure they follow, whether or not you&apos;re
            checking in that day.
          </p>
        </div>
      </div>
    </section>
  );
}
