import { PixelDog } from "@/components/PixelDog";
import { TrackedLink } from "./TrackedLink";
import { Ornament } from "./Flourish";

export function FinalCta() {
  return (
    <section className="bg-ivory px-4 pb-16 sm:px-6 sm:pb-24">
      <div className="relative mx-auto max-w-[1120px] overflow-hidden rounded-lg bg-gradient-to-br from-forest-600 to-forest-900 p-2 text-center text-ivory shadow-[0_28px_60px_-36px_rgba(20,34,25,0.9)]">
        {/* The inset sage rule: a double frame, like an engraved card. */}
        <div className="rounded-md border border-sage/50 px-6 py-12 sm:py-14">
          <div className="mb-5 flex items-end justify-center gap-2" aria-hidden="true">
            <PixelDog size={76} mood="happy" costume="bowtie" tailFrame={3} />
            <PixelDog size={66} variant="mochi" mood="happy" sitting facing={-1} />
          </div>
          <h2 className="mx-auto max-w-[620px] text-balance font-display text-[32px] font-semibold leading-[1.1] tracking-[-0.01em] sm:text-[46px]">
            Your first week is <em className="font-medium italic text-pastel-blush">ready when you are.</em>
          </h2>
          <Ornament className="mt-6" />
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <TrackedLink
              href="/login?mode=signup"
              event="signup_started"
              className="w-full rounded-md bg-ivory px-7 py-3.5 text-sm font-semibold tracking-wide text-forest-900 transition-colors hover:bg-white sm:w-auto"
            >
              Start your plan →
            </TrackedLink>
            <a
              href="#try-a-question"
              className="w-full rounded-md px-7 py-3.5 text-sm font-semibold tracking-wide text-ivory/85 ring-1 ring-sage-light/40 transition-colors hover:text-ivory hover:ring-sage-light/70 sm:w-auto"
            >
              Try a question first
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
