import Link from "next/link";
import { sampleParentReport } from "@/lib/parentDemo";
import { TrackedLink } from "../TrackedLink";
import { C, Tape, Tick } from "./art";
import { Snapshot } from "./ParentSnapshot";

// The pitch and the parent dashboard as one idea: the course, and the
// tracking that runs the whole way through it. Copy on the left, the
// parent's view of it taped in on the right.
export function Pitch() {
  const r = sampleParentReport(new Date());
  return (
    <section className="nb-sec nb-par" id="the-course" aria-labelledby="nb-par-h">
      {/* "For parents" in the nav lands here too. */}
      <span id="parents" className="nb-anchor" aria-hidden />
      <div className="nb-par-copy">
        <h2 id="nb-par-h" className="nb-h2 nb-h2--md">
          Every SAT skill, one week at a time, <span className="nb-hl nb-hl--static">tracked the whole way.</span>
        </h2>
        <p className="nb-body">
          A plan built around your test date, with lessons, practice and full-length tests. Parents follow along on a free dashboard of their own.
        </p>
        <div className="nb-par-ctas">
          <TrackedLink href="/start" event="signup_started" className="nb-btn nb-btn--raised nb-btn--lg">
            Start your plan
          </TrackedLink>
          <TrackedLink href="#try-a-question" event="hero_cta_click" className="nb-textlink">
            Try a free question <span aria-hidden>→</span>
          </TrackedLink>
        </div>
        <ul className="nb-incl nb-incl--row">
          {["7-day free trial", "No card needed"].map((item) => (
            <li key={item}>
              <Tick />
              {item}
            </li>
          ))}
        </ul>
        <p className="nb-body">
          <b>Parents:</b>{" "}
          <TrackedLink href="/parent/login?mode=signup" event="parent_signup_started" className="nb-inline-link">
            create a free account
          </TrackedLink>{" "}
          or{" "}
          <Link href="/parents/sample" className="nb-inline-link">
            see a full report
          </Link>
          .
        </p>
      </div>
      <div className="nb-taped">
        <Tape color={C.butter} pattern="stripe" className="nb-taped-tape nb-taped-tape--a" />
        <Tape color={C.lilac} pattern="dots" className="nb-taped-tape nb-taped-tape--b" />
        <Snapshot r={r} />
      </div>
    </section>
  );
}
