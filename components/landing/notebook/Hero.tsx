import { TrackedLink } from "../TrackedLink";
import { DoodleArrow, Sparkle } from "./art";
import { Room } from "./Room";

const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

export function Hero() {
  return (
    <section className="nb-hero" aria-labelledby="nb-hero-h">
      <div className="nb-hero-copy">
        <span className="nb-chip nb-chip--butter nb-rise" style={d(60)}>
          SAT prep, built by a tutor of 8 years
        </span>
        <h1 id="nb-hero-h" className="nb-h1 nb-rise" style={d(140)}>
          Your SAT plan comes with a <span className="nb-hl">dog.</span>
        </h1>
        <p className="nb-lede nb-rise" style={d(240)}>
          A week-by-week plan to your test date, lessons and quizzes for every SAT skill, and full-length practice tests. You study, Ozho eats.
        </p>
        <div className="nb-cta-row nb-rise" style={d(340)}>
          <TrackedLink href="/start" event="signup_started" className="nb-cta">
            <span className="nb-cta-in">
              <b>Try 5 SAT questions</b>
              <small>no signup · about 5 minutes</small>
            </span>
            <span className="nb-cta-arrow" aria-hidden>
              →
            </span>
          </TrackedLink>
          <span className="nb-anno nb-cta-anno" aria-hidden>
            <DoodleArrow w={70} className="nb-cta-doodle" />
            start here
          </span>
        </div>
        <div className="nb-under nb-rise" style={d(420)}>
          <span className="nb-free">
            <Sparkle size={16} /> 7 days free, no card
          </span>
          <TrackedLink href="/parent/login?mode=signup" event="parent_signup_started" className="nb-parent">
            Parent? Connect to your student&apos;s plan <span aria-hidden>→</span>
          </TrackedLink>
        </div>
      </div>

      <div className="nb-hero-art nb-slap-in">
        <Room />
      </div>
    </section>
  );
}
