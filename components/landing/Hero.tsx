import { BrandMark } from "@/components/BrandMark";
import { HeroPets } from "./HeroPets";

// Server-rendered so the headline and CTA are in the initial HTML -- this is
// the page's LCP element, so it must never start at opacity: 0. Only the
// decorative pet cast (HeroPets, a client component) animates in; the text
// and button render at full opacity immediately.
export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-16 sm:pt-28 sm:pb-24">
      <HeroPets />
      <div className="relative z-10 max-w-[720px] mx-auto text-center">
        <BrandMark size={48} className="mx-auto mb-5 animate-pop-in" />
        <h1 className="font-display font-semibold text-[34px] sm:text-[46px] leading-[1.1] text-ink mb-4 text-balance">
          Every SAT skill. One week at a time.
        </h1>
        <p className="text-[15px] sm:text-base text-gray-600 mb-8 max-w-[520px] mx-auto">
          Built on all 29 official SAT subskills · 361 original practice questions · made by a 6-year SAT tutor.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="#try-a-question"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-ink text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Try a free question →
          </a>
          <a href="#how-it-works" className="text-sm text-gray-500 hover:text-ink transition-colors">
            See how it works
          </a>
        </div>
      </div>
    </section>
  );
}
