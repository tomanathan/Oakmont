import { PixelDog } from "@/components/PixelDog";
import { TrackedLink } from "./TrackedLink";

export function FinalCta() {
  return (
    <section className="bg-white px-4 pb-16 sm:px-6 sm:pb-24">
      <div className="relative mx-auto max-w-[1120px] overflow-hidden rounded-3xl bg-ink px-6 py-12 text-center text-white sm:py-14">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,143,194,0.35)_0%,transparent_60%)]"
          aria-hidden="true"
        />
        <div className="relative">
          <div className="mb-5 flex items-end justify-center gap-2" aria-hidden="true">
            <PixelDog size={76} mood="happy" costume="bowtie" tailFrame={3} />
            <PixelDog size={66} variant="mochi" mood="happy" sitting facing={-1} />
          </div>
          <h2 className="mx-auto max-w-[620px] text-balance font-display text-[32px] font-semibold leading-[1.1] tracking-[-0.01em] sm:text-[46px]">
            Your first week is ready when you are.
          </h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <TrackedLink
              href="/login?mode=signup"
              event="signup_started"
              className="w-full rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-ink transition-opacity hover:opacity-90 sm:w-auto"
            >
              Start your plan →
            </TrackedLink>
            <a
              href="#try-a-question"
              className="w-full rounded-xl px-7 py-3.5 text-sm font-semibold text-white/80 ring-1 ring-white/20 transition-colors hover:text-white hover:ring-white/40 sm:w-auto"
            >
              Try a question first
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
