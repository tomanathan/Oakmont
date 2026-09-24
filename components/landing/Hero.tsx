import { HeroPets } from "./HeroPets";
import { TrackedLink } from "./TrackedLink";
import { Eyebrow, Highlight, Ornament } from "./Flourish";
import { OakTree } from "./OakTree";

// Server-rendered so the headline and CTA are in the initial HTML -- this is
// the page's LCP element, so it must never start at opacity: 0. Only the
// decorative pet cast (HeroPets, a client component) animates in; the text
// renders at full opacity immediately. The bottom padding doubles as the
// floor the pets play on.
export function Hero({ questionCount, subskillCount }: { questionCount: number; subskillCount: number }) {
  return (
    <section
      className="relative overflow-hidden bg-ivory px-6 pt-16 pb-20 sm:pt-24 sm:pb-28"
      style={{
        backgroundImage: [
          "radial-gradient(60% 55% at 50% 0%, #ffffff 0%, transparent 70%)",
          "radial-gradient(40% 60% at 0% 60%, #f2eadb 0%, transparent 70%)",
          "radial-gradient(40% 60% at 100% 60%, #f2eadb 0%, transparent 70%)",
        ].join(", "),
      }}
    >
      {/* Two drawn oaks framing the text, kept to the edges so nothing sits
          behind the headline; the pets play at their roots. Wide screens
          only -- on a phone there's no room beside the copy. */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
        <OakTree seed={7} className="absolute -right-28 bottom-0 w-[400px] opacity-60 xl:-right-6" />
        <OakTree seed={21} className="absolute -left-24 bottom-0 w-[320px] -scale-x-100 opacity-45 xl:-left-4" />
      </div>
      <HeroPets />
      <div className="relative z-10 mx-auto max-w-[760px] text-center">
        <Eyebrow center>Built for the digital SAT</Eyebrow>
        <h1 className="mb-5 text-balance font-display text-[38px] font-semibold leading-[1.05] tracking-[-0.02em] text-forest-900 sm:text-[62px]">
          Every SAT skill.
          <br />
          <Highlight>One week at a time.</Highlight>
        </h1>
        <Ornament className="mb-6" />
        <p className="mx-auto mb-8 max-w-[560px] text-[16px] leading-relaxed text-stone-600 sm:text-[17px]">
          A complete SAT plan built around your test date. We recommend six months, but the plan fits whatever time you have. Lessons for all{" "}
          {subskillCount} skills on the test, {questionCount} original practice questions, and full-length practice tests.
        </p>
        {/* data-hero-actions: HeroPets caps the ball's arc just above this row. */}
        <div data-hero-actions className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <TrackedLink
            href="#try-a-question"
            event="hero_cta_click"
            className="w-full rounded-md bg-forest px-7 py-3.5 text-sm font-semibold tracking-wide text-ivory shadow-[0_10px_24px_-14px_rgba(20,34,25,0.8)] transition-colors hover:bg-forest-600 sm:w-auto"
          >
            Try a free question →
          </TrackedLink>
          <TrackedLink
            href="/login?mode=signup"
            event="signup_started"
            className="w-full rounded-md bg-white/70 px-7 py-3.5 text-sm font-semibold tracking-wide text-forest ring-1 ring-sage/50 transition-colors hover:bg-white sm:w-auto"
          >
            Start your plan
          </TrackedLink>
        </div>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-stone-500">
          {["7-day free trial", "Cancel anytime", "No account needed to try"].map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="#587356" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
        <a
          href="#parents"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-[13px] text-stone-600 ring-1 ring-sage/40 transition-colors hover:text-forest hover:ring-sage/70"
        >
          <span className="rounded-full bg-pastel-blush px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-forest">Parents</span>
          See every session, skill and score, in your own dashboard
          <span aria-hidden>&rarr;</span>
        </a>
      </div>
    </section>
  );
}
