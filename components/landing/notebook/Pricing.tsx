import { getPlanPrices, type PlanId, type PlanPrice } from "@/lib/stripe";
import { formatPrice } from "@/lib/price";
import { TrackedLink } from "../TrackedLink";
import { ViewTracker } from "../ViewTracker";
import { Tick } from "./art";

// Reads the same Stripe Prices /subscribe uses (cached an hour, see
// getPlanPrices): one source of truth, never a hard-coded number. If Stripe
// can't be reached the homepage still renders: the plans show without
// their amounts rather than the whole page failing. LandingPage loads them
// once, for this section and for the page's structured data.
export type PlanPrices = Record<PlanId, PlanPrice> | null;

export async function loadPlanPricesSafely(): Promise<PlanPrices> {
  try {
    return await getPlanPrices();
  } catch (err) {
    console.error("Plan prices unavailable", err);
    return null;
  }
}

export function Pricing({ prices }: { prices: PlanPrices }) {
  const six = prices?.sixmonth ?? null;
  const perMonth = six ? formatPrice(Math.round(six.amountCents / 6 / 100) * 100, six.currency) : null;

  const included = [
    "Week-by-week plan to your test date",
    "Lessons and quizzes for every skill",
    "A schedule for the 8 official practice tests, with score tracking",
    "Parent dashboard and Sunday email",
    "Ozho, the study-buddy dog",
  ];

  return (
    <section className="nb-sec nb-pricing" id="pricing" aria-labelledby="nb-price-h">
      <ViewTracker event="pricing_viewed" />
      <div className="nb-price">
        <span className="nb-kicker">Pricing</span>
        <h2 id="nb-price-h" className="nb-price-h">
          Same course, two ways to pay.
        </h2>
        <p className="nb-body nb-body--tight">Start with 7 days free, no card needed. Choose a plan if it&apos;s working.</p>
        <div className="nb-plans">
          <div className="nb-plan">
            <p className="nb-plan-name">
              Monthly <span className="nb-chip nb-chip--sm nb-chip--line">Flexible</span>
            </p>
            {prices && (
              <p className="nb-plan-price">
                <b>{formatPrice(prices.monthly.amountCents, prices.monthly.currency)}</b>
                <span>/month</span>
              </p>
            )}
            <p className="nb-plan-note">Cancel anytime</p>
            <div className="nb-plan-perk">
              <Tick />
              <div>
                <b>Pay as you go</b>
                <span>Stop whenever prep is done.</span>
              </div>
            </div>
            <TrackedLink href="/parent/login?mode=signup&plan=monthly" event="parent_signup_started" className="nb-btn nb-plan-btn">
              Start free trial
            </TrackedLink>
          </div>
          <div className="nb-plan nb-plan--best">
            <p className="nb-plan-name">
              6-month pass <span className="nb-chip nb-chip--sm">Best value</span>
            </p>
            {six && (
              <p className="nb-plan-price">
                <b>{formatPrice(six.amountCents, six.currency)}</b>
                <span>one time</span>
              </p>
            )}
            <p className="nb-plan-note">One payment{perMonth ? `, about ${perMonth} a month` : ""}</p>
            <div className="nb-plan-perk">
              <Tick />
              <div>
                <b>Covered through a retake</b>
                <span>If your student takes the SAT again, access extends free.</span>
              </div>
            </div>
            <TrackedLink href="/parent/login?mode=signup&plan=sixmonth" event="parent_signup_started" className="nb-btn nb-btn--raised nb-plan-btn">
              Get the 6-month pass
            </TrackedLink>
          </div>
        </div>
        <p className="nb-price-student">
          Student?{" "}
          <TrackedLink href="/start" event="signup_started" className="nb-inline-link">
            Start with 5 free questions
          </TrackedLink>
        </p>
        <p className="nb-kicker nb-incl-h">Both include</p>
        <ul className="nb-incl">
          {included.map((item) => (
            <li key={item}>
              <Tick />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
