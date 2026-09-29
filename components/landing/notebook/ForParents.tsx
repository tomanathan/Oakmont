import Link from "next/link";
import { sampleParentReport } from "@/lib/parentDemo";
import { TrackedLink } from "../TrackedLink";
import { C, Scribble, Tape } from "./art";
import { Snapshot } from "./ParentSnapshot";

// Parents are a core audience: plain words, and "connect" framing only.
export function ForParents() {
  const r = sampleParentReport(new Date());
  return (
    <section className="nb-sec nb-par" id="parents" aria-labelledby="nb-par-h">
      <div className="nb-par-copy">
        <span className="nb-kicker">For parents</span>
        <div className="nb-sec-head">
          <h2 id="nb-par-h" className="nb-h2 nb-h2--md">
            Connect to your student&apos;s plan.
          </h2>
          <Scribble w={220} className="nb-scribble" />
        </div>
        <p className="nb-body">
          Create a free parent account and connect to your student&apos;s plan. Each week you can follow their progress: how much they studied,
          which skills are getting stronger, and how practice tests are going. A short email every Sunday sums it up.
        </p>
        <p className="nb-body">
          The plan is six months recommended, and it sizes itself to fit your test date. You can pay for it from your own account, too.
        </p>
        <div className="nb-par-ctas">
          <TrackedLink href="/parent/login?mode=signup" event="parent_signup_started" className="nb-btn nb-btn--raised nb-btn--lg">
            Create a free parent account
          </TrackedLink>
          <Link href="/parents/sample" className="nb-textlink">
            See a full report <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
      <div className="nb-taped">
        <Tape color={C.butter} pattern="stripe" className="nb-taped-tape nb-taped-tape--a" />
        <Tape color={C.lilac} pattern="dots" className="nb-taped-tape nb-taped-tape--b" />
        <p className="nb-taped-cap" aria-hidden>
          what a parent sees
        </p>
        <Snapshot r={r} />
      </div>
    </section>
  );
}
