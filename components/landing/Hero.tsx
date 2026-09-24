import { HeroPets } from "./HeroPets";
import { TrackedLink } from "./TrackedLink";

// Server-rendered so the headline and CTA are in the initial HTML -- this is
// the page's LCP element, so it must never start at opacity: 0. Only the
// decorative pet cast (HeroPets, a client component) animates in; the text
// renders at full opacity immediately. The bottom padding doubles as the
// floor the pets play on.
export function Hero({ questionCount, subskillCount }: { questionCount: number; subskillCount: number }) {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top,#f3f2fc_0%,#ffffff_60%)] px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
      <HeroPets />
      <div className="relative z-10 mx-auto max-w-[760px] text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e0defa] bg-white/80 px-3 py-1 text-xs font-medium text-[#4a5bb0]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2f6f4f]" aria-hidden="true" />
          Built for the digital SAT
        </div>
        <h1 className="mb-5 text-balance font-display text-[36px] font-semibold leading-[1.05] tracking-[-0.02em] sm:text-[58px]">
          Every SAT skill.
          <br />
          One week at a time.
        </h1>
        <p className="mx-auto mb-8 max-w-[560px] text-[16px] leading-relaxed text-gray-600 sm:text-[17px]">
          A complete SAT plan built around your test date, whether it&apos;s months away or weeks away. Lessons for all{" "}
          {subskillCount} skills on the test, {questionCount} original practice questions, and full-length practice tests.
        </p>
        {/* data-hero-actions: HeroPets caps the ball's arc just above this row. */}
        <div data-hero-actions className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <TrackedLink
            href="#try-a-question"
            event="hero_cta_click"
            className="w-full rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_-12px_rgba(26,26,46,0.6)] transition-opacity hover:opacity-90 sm:w-auto"
          >
            Try a free question →
          </TrackedLink>
          <TrackedLink
            href="/login?mode=signup"
            event="signup_started"
            className="w-full rounded-xl border border-[#e0defa] bg-white px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-[#c9c6ee] sm:w-auto"
          >
            Start your plan
          </TrackedLink>
        </div>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-gray-500">
          {["7-day free trial", "Cancel anytime", "No account needed to try"].map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="#2f6f4f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
        <a
          href="#parents"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-[13px] text-gray-600 ring-1 ring-[#e0defa] transition-colors hover:text-ink hover:ring-[#c9c6ee]"
        >
          <span className="rounded-full bg-ink px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-white">Parents</span>
          See every session, skill and score, in your own dashboard
          <span aria-hidden>&rarr;</span>
        </a>
      </div>
    </section>
  );
}
