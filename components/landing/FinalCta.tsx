import { PixelDog } from "@/components/PixelDog";
import { TrackedLink } from "./TrackedLink";

export function FinalCta() {
  return (
    <section className="bg-white px-4 pb-16 sm:px-6 sm:pb-24">
      <div className="relative mx-auto max-w-[1120px] overflow-hidden rounded-3xl bg-gradient-to-br from-pastel-lilac via-pastel-sky to-pastel-mint px-6 py-12 text-center text-ink sm:py-14">
        <svg className="pointer-events-none absolute left-[8%] top-[18%] hidden sm:block" width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 1.5c.6 5.6 2.9 8.9 9.5 10.5-6.6 1.6-8.9 4.9-9.5 10.5-.6-5.6-2.9-8.9-9.5-10.5C9.1 10.4 11.4 7.1 12 1.5Z" fill="#f5c84c" />
        </svg>
        <svg className="pointer-events-none absolute bottom-[20%] right-[9%] hidden rotate-12 sm:block" width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
          <rect x="2" y="2" width="18" height="18" rx="3" fill="#f3a9c6" />
        </svg>
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
              className="w-full rounded-xl bg-ink px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
            >
              Start your plan →
            </TrackedLink>
            <a
              href="#try-a-question"
              className="w-full rounded-xl bg-white/70 px-7 py-3.5 text-sm font-semibold text-ink ring-1 ring-white transition-colors hover:bg-white sm:w-auto"
            >
              Try a question first
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
