import { TrackedLink } from "../TrackedLink";
import { Room } from "./Room";

const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

// The front door: who this is and what it's for, nothing else. Two ways in:
// students start with questions (/start), parents with their own quick
// setup that ends in sending the teen a link.
export function Hero() {
  return (
    <section className="nb-hero" aria-labelledby="nb-hero-h">
      <div className="nb-hero-copy">
        <h1 id="nb-hero-h" className="nb-h1 nb-rise" style={d(140)}>
          Oakmont <span className="nb-hl">SAT Prep</span>
        </h1>
        <p className="nb-lede nb-rise" style={d(240)}>
          The complete SAT prep course, paced to your test date, with a dashboard that keeps parents in the loop.
        </p>
        <div className="nb-cta-row nb-rise" style={d(340)}>
          <TrackedLink href="/start" event="signup_started" className="nb-cta">
            <span className="nb-cta-in">
              <b>I&apos;m a student: start free</b>
            </span>
            <span className="nb-cta-arrow" aria-hidden>
              →
            </span>
          </TrackedLink>
          <TrackedLink href="/parent/login?mode=signup" event="parent_signup_started" className="nb-btn nb-btn--raised nb-btn--lg">
            I&apos;m a parent: start free
          </TrackedLink>
        </div>
        <p className="nb-under nb-rise" style={d(420)}>
          7 days free. No card needed. Students start with 5 quick questions.
        </p>
      </div>

      <div className="nb-hero-art nb-slap-in">
        <Room />
      </div>
    </section>
  );
}
