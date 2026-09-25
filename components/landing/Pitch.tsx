import Link from "next/link";
import { sampleParentReport } from "@/lib/parentDemo";
import { TrackedLink } from "./TrackedLink";
import { Highlight } from "./Flourish";
import { Snapshot } from "./ParentSnapshot";

// The pitch and the parent dashboard as one idea: the course, and the
// tracking that runs the whole way through it. Copy on the left, the
// parent's view of it on the right. One scroll below the title page.
export function Pitch() {
  const r = sampleParentReport(new Date());
  return (
    <section id="the-course" className="scroll-mt-20 overflow-hidden border-t border-sage/30 bg-parchment px-6 py-16 sm:py-24">
      {/* "For parents" in the nav lands here too. */}
      <span id="parents" className="block scroll-mt-20" aria-hidden />
      <div className="mx-auto grid max-w-[1120px] items-center gap-12 lg:grid-cols-[1fr_520px] lg:gap-16">
        <div>
          <h2 className="text-balance font-display text-[36px] font-semibold leading-[1.05] tracking-[-0.02em] text-forest-900 sm:text-[52px]">
            Every SAT skill, one week at a time, <Highlight>tracked the whole way.</Highlight>
          </h2>
          <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-stone-600 sm:text-[17px]">
            A week-by-week plan built around your test date, with lessons, practice and full-length tests. Parents follow along
            on their own free dashboard.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <TrackedLink
              href="/login?mode=signup"
              event="signup_started"
              className="rounded-md bg-forest px-7 py-3.5 text-center text-sm font-semibold tracking-wide text-ivory shadow-[0_10px_24px_-14px_rgba(20,34,25,0.8)] transition-colors hover:bg-forest-600"
            >
              Start your plan
            </TrackedLink>
            <TrackedLink
              href="#try-a-question"
              event="hero_cta_click"
              className="rounded-md bg-white/70 px-7 py-3.5 text-center text-sm font-semibold tracking-wide text-forest ring-1 ring-sage/50 transition-colors hover:bg-white"
            >
              Try a free question →
            </TrackedLink>
          </div>
          <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-stone-500">
            {["7-day free trial", "Cancel anytime"].map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="#587356" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[14px] text-stone-600">
            <span className="font-semibold text-ink">Parents:</span>{" "}
            <TrackedLink href="/parent/login?mode=signup" event="parent_signup_started" className="font-semibold text-forest underline decoration-sage/50 underline-offset-4 hover:decoration-forest">
              create a free account
            </TrackedLink>{" "}
            or{" "}
            <Link href="/parents/sample" className="font-semibold text-forest underline decoration-sage/50 underline-offset-4 hover:decoration-forest">
              see the full view
            </Link>
            .
          </p>
        </div>
        <div className="sm:pb-32 sm:pl-10">
          <Snapshot r={r} />
        </div>
      </div>
    </section>
  );
}
