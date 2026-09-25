import { TrackedLink } from "./TrackedLink";
import { Highlight, Ornament } from "./Flourish";

// The pitch, one scroll below the title page (Hero.tsx): what the course is
// and how to start, then the proof strip and everything else follow.
export function Pitch({ questionCount, subskillCount }: { questionCount: number; subskillCount: number }) {
  return (
    <section id="the-course" className="scroll-mt-20 border-t border-sage/30 bg-parchment px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-[760px] text-center">
        <h2 className="mb-5 text-balance font-display text-[36px] font-semibold leading-[1.05] tracking-[-0.02em] text-forest-900 sm:text-[56px]">
          Every SAT skill.
          <br />
          <Highlight>One week at a time.</Highlight>
        </h2>
        <Ornament className="mb-6" />
        <p className="mx-auto mb-8 max-w-[560px] text-[16px] leading-relaxed text-stone-600 sm:text-[17px]">
          A week-by-week plan built around your test date: lessons for all {subskillCount} skills, {questionCount} practice questions
          and 8 full-length tests.
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
          {["7-day free trial", "Cancel anytime"].map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="#587356" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
