import { stripe, getPriceId, type PlanId } from "@/lib/stripe";
import { TrackedLink } from "./TrackedLink";
import { ViewTracker } from "./ViewTracker";
import { Eyebrow } from "./Flourish";

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

  // Listed once, under both cards -- it's the same either way, so printing
  // it inside each card only made the two look identical.
  const included = [
    "Week-by-week plan to your test date",
    "Lessons and quizzes for every skill",
    "Full-length practice tests",
    "Parent dashboard and Sunday email",
    "Ozho and his wardrobe",
  ];

  return (
    <section id="pricing" className="scroll-mt-20 bg-gradient-to-b from-forest-600 to-forest-900 px-6 py-16 text-ivory sm:py-20">
      <ViewTracker event="pricing_viewed" />
      <div className="mx-auto max-w-[1120px]">
        <div className="mx-auto mb-10 max-w-[620px] text-center">
          <Eyebrow center light>Pricing</Eyebrow>
          <h2 className="text-balance font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.01em] sm:text-[42px]">
            Same course, two ways to pay.
          </h2>
        </div>

        <div className="mx-auto grid max-w-[860px] gap-4 md:grid-cols-2">
          <div className="flex flex-col rounded-lg bg-white/[0.06] p-7 ring-1 ring-sage-light/30 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="font-display text-[19px] font-semibold">Monthly</div>
              <div className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-sage-light ring-1 ring-sage-light/50">
                7-day free trial
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[46px] font-semibold leading-none">${monthlyPrice.toFixed(0)}</span>
              <span className="text-sm text-ivory/60">/month</span>
            </div>
            <div className="mt-2 text-sm text-ivory/60">Cancel anytime</div>
            <div className="mb-1 mt-5 flex flex-1 items-start gap-3 rounded-lg bg-white/[0.06] px-4 py-3 ring-1 ring-sage-light/20">
              <span className="mt-0.5 text-sage-light">
                <Check />
              </span>
              <div>
                <div className="text-sm font-semibold text-ivory">Pay as you go</div>
                <div className="text-[13px] text-ivory/60">Stop whenever prep is done.</div>
              </div>
            </div>
            <TrackedLink
              href="/login?mode=signup"
              event="signup_started"
              className="mt-8 rounded-md px-6 py-3.5 text-center text-sm font-semibold tracking-wide text-ivory ring-1 ring-sage-light/50 transition-colors hover:bg-white/10"
            >
              Start free trial
            </TrackedLink>
          </div>

          <div className="relative flex flex-col rounded-lg bg-ivory p-7 text-forest-900 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.6)] ring-1 ring-sage/60 ring-offset-4 ring-offset-ivory sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="font-display text-[19px] font-semibold">6-month pass</div>
              <div className="rounded-full bg-pastel-butter px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-forest">
                Best value
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[46px] font-semibold leading-none">${sixTotal.toFixed(0)}</span>
              <span className="text-sm text-stone-500">one time</span>
            </div>
            <div className="mt-2 text-sm text-stone-500">About ${(sixTotal / 6).toFixed(0)}/month, paid once</div>
            {/* The pass's one extra: retake cover (lib/retakeCover.ts). */}
            <div className="mb-1 mt-5 flex flex-1 items-start gap-3 rounded-lg bg-pastel-sage px-4 py-3">
              <span className="mt-0.5 text-forest">
                <Check />
              </span>
              <div>
                <div className="text-sm font-semibold text-forest-900">Covered through a retake</div>
                <div className="text-[13px] text-stone-600">If they sit the SAT again, access extends free.</div>
              </div>
            </div>
            <TrackedLink
              href="/login?mode=signup"
              event="signup_started"
              className="mt-8 rounded-md bg-forest px-6 py-3.5 text-center text-sm font-semibold tracking-wide text-ivory transition-colors hover:bg-forest-600"
            >
              Get the 6-month pass
            </TrackedLink>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-[860px] text-center">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-sage-light">Both include</div>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ivory/85">
            {included.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-sage-light">
                  <Check />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
