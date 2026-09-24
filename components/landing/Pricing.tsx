import { ALL_SUBSKILLS } from "@/data/curriculum";
import { stripe, getPriceId, type PlanId } from "@/lib/stripe";
import { TrackedLink } from "./TrackedLink";
import { ViewTracker } from "./ViewTracker";
import { Eyebrow, Highlight, PINSTRIPE } from "./Flourish";

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
    <section id="pricing" className="relative scroll-mt-20 bg-gradient-to-b from-forest to-forest-900 px-6 py-16 text-ivory sm:py-20">
      <ViewTracker event="pricing_viewed" />
      <div className="pointer-events-none absolute inset-0" style={PINSTRIPE} aria-hidden="true" />
      <div className="relative mx-auto max-w-[1120px]">
        <div className="mx-auto mb-10 max-w-[620px] text-center">
          <Eyebrow center light>Pricing</Eyebrow>
          <h2 className="text-balance font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.01em] sm:text-[42px]">
            <Highlight dark>Everything included</Highlight>, either way.
          </h2>
        </div>

        <div className="mx-auto grid max-w-[860px] gap-4 md:grid-cols-2">
          <div className="relative flex flex-col rounded-lg bg-ivory p-7 text-forest-900 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.6)] ring-1 ring-brass/60 ring-offset-4 ring-offset-ivory sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="font-display text-[19px] font-semibold">6-month pass</div>
              <div className="rounded-full bg-[linear-gradient(180deg,#e6cf95,#b98f45)] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-forest-900">
                Best value
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[46px] font-semibold leading-none">${sixTotal.toFixed(0)}</span>
              <span className="text-sm text-stone-500">one time</span>
            </div>
            <div className="mt-2 text-sm text-stone-500">
              About ${(sixTotal / 6).toFixed(0)}/month · one payment, nothing to cancel
            </div>
            <ul className="mt-7 flex flex-1 flex-col gap-2.5 text-sm text-stone-700">
              {included.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="text-brass"><Check /></span>
                  {item}
                </li>
              ))}
            </ul>
            <TrackedLink
              href="/login?mode=signup"
              event="signup_started"
              className="mt-8 rounded-md bg-forest px-6 py-3.5 text-center text-sm font-semibold tracking-wide text-ivory transition-colors hover:bg-forest-600"
            >
              Get the 6-month pass
            </TrackedLink>
          </div>

          <div className="flex flex-col rounded-lg bg-white/[0.06] p-7 ring-1 ring-brass-light/30 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="font-display text-[19px] font-semibold">Monthly</div>
              <div className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brass-light ring-1 ring-brass-light/50">
                7-day free trial
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[46px] font-semibold leading-none">${monthlyPrice.toFixed(0)}</span>
              <span className="text-sm text-ivory/60">/month</span>
            </div>
            <div className="mt-2 text-sm text-ivory/60">Cancel anytime from Settings</div>
            <ul className="mt-7 flex flex-1 flex-col gap-2.5 text-sm text-ivory/85">
              {included.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="text-brass-light"><Check /></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <TrackedLink
              href="/login?mode=signup"
              event="signup_started"
              className="mt-8 rounded-md px-6 py-3.5 text-center text-sm font-semibold tracking-wide text-ivory ring-1 ring-brass-light/50 transition-colors hover:bg-white/10"
            >
              Start free trial
            </TrackedLink>
          </div>
        </div>
      </div>
    </section>
  );
}
