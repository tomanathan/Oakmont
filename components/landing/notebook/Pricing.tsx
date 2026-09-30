import { getPlanPrices } from "@/lib/stripe";
import { formatPrice } from "@/lib/price";
import { TrackedLink } from "../TrackedLink";
import { ViewTracker } from "../ViewTracker";
import { Tick } from "./art";

// Reads the same Stripe Prices /subscribe uses (cached an hour, see
// getPlanPrices): one source of truth, never a hard-coded number.
export async function Pricing() {
  const prices = await getPlanPrices();
  const six = prices.sixmonth;
  const perMonth = formatPrice(Math.round(six.amountCents / 6 / 100) * 100, six.currency);

  const included = [
    "Week-by-week plan to your test date",
    "Lessons and quizzes for every skill",
    "Full-length practice tests",
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
            <p className="nb-plan-price">
              <b>{formatPrice(prices.monthly.amountCents, prices.monthly.currency)}</b>
              <span>/month</span>
            </p>
            <p className="nb-plan-note">Cancel anytime</p>
            <div className="nb-plan-perk">
              <Tick />
              <div>
                <b>Pay as you go</b>
                <span>Stop whenever prep is done.</span>
              </div>
            </div>
            <TrackedLink href="/parent/login?mode=signup" event="parent_signup_started" className="nb-btn nb-plan-btn">
              Start free trial
            </TrackedLink>
          </div>
          <div className="nb-plan nb-plan--best">
            <p className="nb-plan-name">
              6-month pass <span className="nb-chip nb-chip--sm">Best value</span>
            </p>
            <p className="nb-plan-price">
              <b>{formatPrice(six.amountCents, six.currency)}</b>
              <span>one time</span>
            </p>
            <p className="nb-plan-note">One payment, about {perMonth} a month</p>
            <div className="nb-plan-perk">
              <Tick />
              <div>
                <b>Covered through a retake</b>
                <span>If your student takes the SAT again, access extends free.</span>
              </div>
            </div>
            <TrackedLink href="/parent/login?mode=signup" event="parent_signup_started" className="nb-btn nb-btn--raised nb-plan-btn">
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
