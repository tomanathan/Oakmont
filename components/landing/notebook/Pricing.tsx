import { PixelDog } from "@/components/PixelDog";
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
      <div className="nb-price-row">
        <div className="nb-price">
          <span className="nb-kicker">Pricing</span>
          <h2 id="nb-price-h" className="nb-price-h">
            7 days free. No card needed.
          </h2>
          <p className="nb-body nb-body--tight">Same course, two ways to pay. Choose a plan if it&apos;s working.</p>
          <div className="nb-plans">
            <div className="nb-plan">
              <p className="nb-plan-name">Monthly</p>
              <p className="nb-plan-price">
                <b>{formatPrice(prices.monthly.amountCents, prices.monthly.currency)}</b>
                <span>a month</span>
              </p>
              <p className="nb-plan-note">Cancel anytime. Stop whenever prep is done.</p>
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
                <span>one payment</span>
              </p>
              <p className="nb-plan-note">About {perMonth} a month. Covered through a retake: if your student takes the SAT again, access extends free.</p>
              <TrackedLink href="/parent/login?mode=signup" event="parent_signup_started" className="nb-btn nb-btn--raised nb-plan-btn">
                Get the 6-month pass
              </TrackedLink>
            </div>
          </div>
          <p className="nb-kicker nb-incl-h">Both include</p>
          <ul className="nb-incl">
            {included.map((item) => (
              <li key={item}>
                <Tick />
                {item}
              </li>
            ))}
          </ul>
          <p className="nb-price-student">
            Student?{" "}
            <TrackedLink href="/start" event="signup_started" className="nb-inline-link">
              Start with 5 free questions
            </TrackedLink>
          </p>
        </div>

        <div className="nb-closet">
          <p className="nb-closet-h">10 costumes to unlock. At 30 days of study, Mochi moves in.</p>
          <div className="nb-closet-row" aria-hidden>
            {["scarf", "flame-collar", "explorer-hat", "cape"].map((c, i) => (
              <span key={c} className="nb-closet-stk" style={{ ["--r" as string]: `${[-6, 4, -2, 7][i]}deg` }}>
                <PixelDog size={64} mood="happy" costume={c} shadow={false} />
              </span>
            ))}
            <span className="nb-closet-stk" style={{ ["--r" as string]: "-4deg" }}>
              <PixelDog size={64} mood="happy" variant="mochi" shadow={false} />
            </span>
          </div>
          <p className="nb-anno nb-closet-anno" aria-hidden>
            that last one&apos;s mochi
          </p>
        </div>
      </div>
    </section>
  );
}
