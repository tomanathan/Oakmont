import { TrackedLink } from "./TrackedLink";
import { Eyebrow, Highlight, Ornament } from "./Flourish";

// The pitch, one scroll below the title page (Hero.tsx): what the course is
// and how to start, then the proof strip and everything else follow.
export function Pitch({ questionCount, subskillCount }: { questionCount: number; subskillCount: number }) {
  return (
    <section id="the-course" className="scroll-mt-20 border-t border-sage/30 bg-parchment px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-[760px] text-center">
        <Eyebrow center>Built for the digital SAT</Eyebrow>
        <h2 className="mb-5 text-balance font-display text-[36px] font-semibold leading-[1.05] tracking-[-0.02em] text-forest-900 sm:text-[56px]">
          Every SAT skill.
          <br />
          <Highlight>One week at a time.</Highlight>
        </h2>
        <Ornament className="mb-6" />
        <p className="mx-auto mb-8 max-w-[560px] text-[16px] leading-relaxed text-stone-600 sm:text-[17px]">
          A complete SAT plan built around your test date. We recommend six months, but the plan fits whatever time you have. Lessons for all{" "}
          {subskillCount} skills on the test, {questionCount} original practice questions, and full-length practice tests.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
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
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-[13px] text-stone-600 ring-1 ring-sage/40 transition-colors hover:text-forest hover:ring-sage/70"
        >
          <span className="rounded-full bg-pastel-blush px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-forest">Parents</span>
          See every session, skill and score, in your own dashboard
          <span aria-hidden>&rarr;</span>
        </a>
      </div>
    </section>
  );
}
