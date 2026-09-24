import { HeroPets } from "./HeroPets";
import { TrackedLink } from "./TrackedLink";
import { BrandMark } from "@/components/BrandMark";
import { Eyebrow, GOLD_BUTTON, Highlight, Ornament, PINSTRIPE } from "./Flourish";

// Server-rendered so the headline and CTA are in the initial HTML -- this is
// the page's LCP element, so it must never start at opacity: 0. Only the
// decorative pet cast (HeroPets, a client component) animates in; the text
// renders at full opacity immediately. The bottom padding doubles as the
// floor the pets play on.
export function Hero({ questionCount, subskillCount }: { questionCount: number; subskillCount: number }) {
  return (
    <section className="relative overflow-hidden bg-forest px-6 pt-16 pb-20 text-ivory sm:pt-24 sm:pb-28">
      {/* Cloth-like pinstripe, a lamp-lit glow at the top, and the oak as a
          faint watermark behind the headline. */}
      <div className="pointer-events-none absolute inset-0" style={PINSTRIPE} aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_0%,rgba(255,236,190,0.16)_0%,transparent_65%),radial-gradient(80%_60%_at_50%_120%,rgba(0,0,0,0.35)_0%,transparent_70%)]"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 opacity-[0.06] [filter:brightness(0)_invert(1)] sm:top-10" aria-hidden="true">
        <BrandMark size={520} />
      </div>
      <HeroPets />
      <div className="relative z-10 mx-auto max-w-[760px] text-center">
        <Eyebrow center light>Built for the digital SAT</Eyebrow>
        <h1 className="mb-5 text-balance font-display text-[38px] font-semibold leading-[1.05] tracking-[-0.02em] text-ivory sm:text-[64px]">
          Every SAT skill.
          <br />
          <Highlight dark>One week at a time.</Highlight>
        </h1>
        <Ornament className="mb-6" />
        <p className="mx-auto mb-8 max-w-[560px] text-[16px] leading-relaxed text-ivory/75 sm:text-[17px]">
          A complete SAT plan built around your test date. We recommend six months, but the plan fits whatever time you have. Lessons for all{" "}
          {subskillCount} skills on the test, {questionCount} original practice questions, and full-length practice tests.
        </p>
        {/* data-hero-actions: HeroPets caps the ball's arc just above this row. */}
        <div data-hero-actions className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <TrackedLink
            href="#try-a-question"
            event="hero_cta_click"
            className={`w-full rounded-md px-7 py-3.5 text-sm font-semibold tracking-wide transition sm:w-auto ${GOLD_BUTTON}`}
          >
            Try a free question →
          </TrackedLink>
          <TrackedLink
            href="/login?mode=signup"
            event="signup_started"
            className="w-full rounded-md px-7 py-3.5 text-sm font-semibold tracking-wide text-ivory ring-1 ring-brass-light/50 transition-colors hover:bg-white/10 sm:w-auto"
          >
            Start your plan
          </TrackedLink>
        </div>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-ivory/60">
          {["7-day free trial", "Cancel anytime", "No account needed to try"].map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="#e6cf95" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
        <a
          href="#parents"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-black/20 px-4 py-2 text-[13px] text-ivory/80 ring-1 ring-brass-light/30 transition-colors hover:text-ivory hover:ring-brass-light/60"
        >
          <span className="rounded-full bg-brass-light px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-forest-900">Parents</span>
          See every session, skill and score, in your own dashboard
          <span aria-hidden>&rarr;</span>
        </a>
      </div>
    </section>
  );
}
