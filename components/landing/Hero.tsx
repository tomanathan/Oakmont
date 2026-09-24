import { HeroPets } from "./HeroPets";
import { TrackedLink } from "./TrackedLink";
import { Highlight } from "./Highlight";

// Server-rendered so the headline and CTA are in the initial HTML -- this is
// the page's LCP element, so it must never start at opacity: 0. Only the
// decorative pet cast (HeroPets, a client component) animates in; the text
// renders at full opacity immediately. The bottom padding doubles as the
// floor the pets play on.
export function Hero({ questionCount, subskillCount }: { questionCount: number; subskillCount: number }) {
  return (
    <section
      className="relative overflow-hidden bg-tint-50 px-6 pt-16 pb-20 sm:pt-24 sm:pb-28"
      style={{
        backgroundImage: [
          "radial-gradient(45% 60% at 8% 12%, #dcd8f6 0%, transparent 70%)",
          "radial-gradient(40% 55% at 94% 18%, #e5e2fa 0%, transparent 70%)",
          "radial-gradient(55% 45% at 50% 0%, #ffffff 0%, transparent 70%)",
          "radial-gradient(35% 40% at 90% 78%, #e5e2fa 0%, transparent 70%)",
        ].join(", "),
      }}
    >
      <Shapes />
      <HeroPets />
      <div className="relative z-10 mx-auto max-w-[760px] text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-tint-700 shadow-[0_2px_8px_-4px_rgba(74,91,176,0.35)] ring-1 ring-tint-200">
          <span className="h-1.5 w-1.5 rounded-full bg-tint-700" aria-hidden="true" />
          Built for the digital SAT
        </div>
        <h1 className="mb-5 text-balance font-display text-[36px] font-semibold leading-[1.05] tracking-[-0.02em] sm:text-[58px]">
          Every SAT skill.
          <br />
          <Highlight>One week</Highlight> at a time.
        </h1>
        <p className="mx-auto mb-8 max-w-[560px] text-[16px] leading-relaxed text-gray-600 sm:text-[17px]">
          A complete SAT plan built around your test date. We recommend six months, but the plan fits whatever time you have. Lessons for all{" "}
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
            className="w-full rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-ink shadow-[0_6px_18px_-10px_rgba(74,91,176,0.5)] ring-1 ring-tint-200 transition-colors hover:ring-tint-300 sm:w-auto"
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
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-[13px] text-gray-600 shadow-[0_6px_18px_-10px_rgba(74,91,176,0.5)] ring-1 ring-tint-200 transition-colors hover:text-ink hover:ring-tint-300"
        >
          <span className="rounded-full bg-hi px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-ink">Parents</span>
          See every session, skill and score, in your own dashboard
          <span aria-hidden>&rarr;</span>
        </a>
      </div>
    </section>
  );
}

// A few small shapes in the corners, Khan Academy style: theme shades,
// with the one star in the accent. Wide
// screens only: on a phone they'd crowd the headline.
function Shapes() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
      <svg className="absolute left-[7%] top-[16%]" width="30" height="30" viewBox="0 0 24 24">
        <path d="M12 1.5c.6 5.6 2.9 8.9 9.5 10.5-6.6 1.6-8.9 4.9-9.5 10.5-.6-5.6-2.9-8.9-9.5-10.5C9.1 10.4 11.4 7.1 12 1.5Z" fill="#ffd15c" />
      </svg>
      <svg className="absolute right-[9%] top-[22%] rotate-12" width="22" height="22" viewBox="0 0 22 22">
        <rect x="2" y="2" width="18" height="18" rx="3" fill="#c2bcee" />
      </svg>
      <svg className="absolute left-[12%] top-[58%]" width="26" height="26" viewBox="0 0 26 26">
        <circle cx="13" cy="13" r="9.5" fill="none" stroke="#9f98e0" strokeWidth="4" />
      </svg>
      <svg className="absolute right-[6%] top-[55%] -rotate-12" width="28" height="26" viewBox="0 0 28 26">
        <path d="M14 2 26 24H2Z" fill="#dcd8f6" strokeLinejoin="round" />
      </svg>
      <svg className="absolute left-[24%] top-[8%]" width="12" height="12" viewBox="0 0 12 12">
        <circle cx="6" cy="6" r="6" fill="#9f98e0" />
      </svg>
      <svg className="absolute right-[24%] top-[9%]" width="10" height="10" viewBox="0 0 10 10">
        <circle cx="5" cy="5" r="5" fill="#c2bcee" />
      </svg>
    </div>
  );
}
