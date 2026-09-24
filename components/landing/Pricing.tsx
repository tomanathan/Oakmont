import { ALL_SUBSKILLS } from "@/data/curriculum";
import { stripe, getPriceId, type PlanId } from "@/lib/stripe";
import { TrackedLink } from "./TrackedLink";
import { ViewTracker } from "./ViewTracker";

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" className="mt-[3px] flex-shrink-0" aria-hidden="true">
      <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Reads the same live Stripe Prices /subscribe uses -- one source of truth
// for what things cost, never a hard-coded number that could drift.
export async function Pricing() {
  const planIds: PlanId[] = ["sixmonth", "monthly"];
  const [sixmonth, monthly] = await Promise.all(planIds.map((id) => stripe.prices.retrieve(getPriceId(id))));
  const sixTotal = (sixmonth.unit_amount ?? 0) / 100;
  const monthlyPrice = (monthly.unit_amount ?? 0) / 100;

  const included = [
    "Your week-by-week plan, paced to your test date",
    `Lessons, worked examples and quizzes for all ${ALL_SUBSKILLS.length} SAT skills`,
        "8 full-length practice tests with review",
    "Ozho, streaks and the costume wardrobe",
    "Parent dashboard and Sunday email report (parent accounts are free)",
  ];

  return (
    <section id="pricing" className="scroll-mt-20 bg-pastel-mint/60 px-6 py-16 sm:py-20">
      <ViewTracker event="pricing_viewed" />
      <div className="mx-auto max-w-[1120px]">
        <div className="mx-auto mb-10 max-w-[620px] text-center">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#4a5bb0]">Pricing</div>
          <h2 className="text-balance font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.01em] sm:text-[40px]">
            Everything included, either way.
          </h2>
        </div>

        <div className="mx-auto grid max-w-[860px] gap-4 md:grid-cols-2">
          <div className="relative flex flex-col rounded-2xl bg-ink p-7 text-white shadow-[0_24px_60px_-30px_rgba(26,26,46,0.7)] sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm font-semibold">6-month pass</div>
              <div className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
                Best value
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[46px] font-semibold leading-none">${sixTotal.toFixed(0)}</span>
              <span className="text-sm text-white/60">one time</span>
            </div>
            <div className="mt-2 text-sm text-white/60">
              About ${(sixTotal / 6).toFixed(0)}/month · one payment, nothing to cancel
            </div>
            <ul className="mt-7 flex flex-1 flex-col gap-2.5 text-sm text-white/85">
              {included.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <Check />
                  {item}
                </li>
              ))}
            </ul>
            <TrackedLink
              href="/login?mode=signup"
              event="signup_started"
              className="mt-8 rounded-xl bg-white px-6 py-3.5 text-center text-sm font-semibold text-ink transition-opacity hover:opacity-90"
            >
              Get the 6-month pass
            </TrackedLink>
          </div>

          <div className="flex flex-col rounded-2xl border border-[#e6e4f5] bg-white p-7 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm font-semibold">Monthly</div>
              <div className="rounded-full bg-[#eef7f1] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#2f6f4f]">
                7-day free trial
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[46px] font-semibold leading-none">${monthlyPrice.toFixed(0)}</span>
              <span className="text-sm text-gray-500">/month</span>
            </div>
            <div className="mt-2 text-sm text-gray-500">Cancel anytime from Settings</div>
            <ul className="mt-7 flex flex-1 flex-col gap-2.5 text-sm text-gray-700">
              {included.map((item) => (
                <li key={item} className="flex gap-2.5 text-[#2f6f4f]">
                  <Check />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
            <TrackedLink
              href="/login?mode=signup"
              event="signup_started"
              className="mt-8 rounded-xl border border-[#e0defa] px-6 py-3.5 text-center text-sm font-semibold text-ink transition-colors hover:border-[#c9c6ee]"
            >
              Start free trial
            </TrackedLink>
          </div>
        </div>
      </div>
    </section>
  );
}
