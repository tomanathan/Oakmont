import { BrandMark } from "@/components/BrandMark";
import { HeroPets } from "./HeroPets";
import { TrackedLink } from "./TrackedLink";
import { Ornament } from "./Flourish";
import { OakTree } from "./OakTree";

// The front door: who this is and what it's for, nothing else. The name,
// one plain line on what it does, and a way in -- the pitch itself starts
// one scroll down (Pitch.tsx), so a first-time visitor knows where they
// are before being sold anything. Fills the first screen so that reads as
// a deliberate title page, not a hero that forgot its copy. Server-rendered
// (LCP); only the pet cast animates in. The bottom padding is the floor
// the pets play on, at the roots of the two drawn oaks.
export function Hero() {
  return (
    <section
      className="relative flex min-h-[calc(100svh-69px)] flex-col items-center justify-center overflow-hidden bg-ivory px-6 pb-28 pt-14 sm:pb-32"
      style={{
        backgroundImage: [
          "radial-gradient(60% 55% at 50% 30%, #ffffff 0%, transparent 70%)",
          "radial-gradient(40% 60% at 0% 60%, #f2eadb 0%, transparent 70%)",
          "radial-gradient(40% 60% at 100% 60%, #f2eadb 0%, transparent 70%)",
        ].join(", "),
      }}
    >
      {/* Two drawn oaks framing the title, kept to the edges so nothing
          sits behind it; the pets play at their roots. Wide screens only --
          on a phone there's no room beside the copy. */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
        <OakTree seed={7} className="absolute -right-28 bottom-0 w-[440px] opacity-60 xl:-right-6" />
        <OakTree seed={21} className="absolute -left-24 bottom-0 w-[360px] -scale-x-100 opacity-45 xl:-left-4" />
      </div>
      <HeroPets />
      <div className="relative z-10 mx-auto max-w-[820px] text-center">
        <BrandMark size={88} className="mx-auto mb-6 sm:mb-8" />
        <h1 className="text-balance font-display text-[52px] font-semibold leading-[0.98] tracking-[-0.025em] text-forest-900 sm:text-[92px]">
          Oakmont <span className="whitespace-nowrap">SAT Prep</span>
        </h1>
        <Ornament className="my-6 sm:my-7" />
        <p className="mx-auto max-w-[560px] text-[18px] leading-relaxed text-stone-600 sm:text-[21px]">
          The complete SAT prep course, paced to your test date, with a dashboard that keeps parents in the loop.
        </p>
        {/* data-hero-actions: HeroPets caps the ball's arc just above this row. */}
        <div data-hero-actions className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <TrackedLink
            href="/login?mode=signup"
            event="signup_started"
            className="w-full rounded-md bg-forest px-7 py-3.5 text-sm font-semibold tracking-wide text-ivory shadow-[0_10px_24px_-14px_rgba(20,34,25,0.8)] transition-colors hover:bg-forest-600 sm:w-auto"
          >
            Start free
          </TrackedLink>
          <a
            href="#the-course"
            className="w-full rounded-md bg-white/70 px-7 py-3.5 text-sm font-semibold tracking-wide text-forest ring-1 ring-sage/50 transition-colors hover:bg-white sm:w-auto"
          >
            Take a look &darr;
          </a>
        </div>
      </div>
    </section>
  );
}
