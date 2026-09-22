import { PixelDog } from "@/components/PixelDog";
import { TrackedLink } from "./TrackedLink";

export function FinalCta() {
  return (
    <section className="px-6 py-16 sm:py-20">
      <div className="max-w-[520px] mx-auto text-center">
        <div className="flex justify-center mb-4" aria-hidden="true">
          <PixelDog size={56} mood="happy" />
        </div>
        <h2 className="font-display font-semibold text-[26px] sm:text-[30px] text-ink mb-2">
          Every SAT skill. One week at a time.
        </h2>
        <p className="text-sm text-gray-500 mb-6">Start free — the plan and the first quiz cost nothing to try.</p>
        <TrackedLink
          href="/login?mode=signup"
          event="signup_started"
          className="inline-block px-7 py-3 rounded-lg bg-ink text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Start free →
        </TrackedLink>
      </div>
    </section>
  );
}
