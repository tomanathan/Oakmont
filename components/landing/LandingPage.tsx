import { BrandMark } from "@/components/BrandMark";
import { LegalFooter } from "@/components/LegalFooter";
import { Hero } from "./Hero";
import { SampleQuestion } from "./SampleQuestion";
import { TestDatePicker } from "./TestDatePicker";
import { HowItWorks } from "./HowItWorks";
import { TutorSection } from "./TutorSection";
import { Pricing } from "./Pricing";
import { Faq } from "./Faq";
import { FAQ_ITEMS } from "@/lib/landingFaq";
import { FinalCta } from "./FinalCta";
import { Reveal } from "./Reveal";
import { TrackedLink } from "./TrackedLink";

// The public, logged-out front door at oakmontsat.com -- server-rendered so
// the value proposition (not just a login form) is what search engines and
// shared links actually see. Composes the sections in the order laid out
// in the landing-page plan; see app/page.tsx for where this is mounted
// (the logged-out branch only -- an authenticated visit to "/" still
// redirects straight to /dashboard or /subscribe, unchanged).
//
// Note: no page-load "seen" flag and no scroll-jacked intro -- the earlier
// splash-screen design was deliberately replaced by this real landing page;
// see the plan file's Context section for why.
export function LandingPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="font-sans">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <nav className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-[#faf8f4]/90 backdrop-blur border-b border-[#ece9f7]">
        <div className="flex items-center gap-2 min-w-0">
          <BrandMark size={26} className="flex-shrink-0" />
          <span className="font-display font-semibold text-sm text-ink truncate hidden sm:inline">
            Oakmont Study Center
          </span>
        </div>
        {/* Jump links -- orientation for what is otherwise a single long
            scroll. Kept to three items and hidden below `sm` so they never
            compete for space with the brand mark / Log in / Start free,
            which already fit tightly on narrow phones. */}
        <div className="hidden sm:flex items-center gap-5 text-sm text-gray-500 flex-shrink-0">
          <a href="#how-it-works" className="hover:text-ink transition-colors whitespace-nowrap">
            How it works
          </a>
          <a href="#pricing" className="hover:text-ink transition-colors whitespace-nowrap">
            Pricing
          </a>
          <a href="#faq" className="hover:text-ink transition-colors whitespace-nowrap">
            FAQ
          </a>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <a href="/login" className="text-sm text-gray-500 hover:text-ink transition-colors whitespace-nowrap">
            Log in
          </a>
          <TrackedLink
            href="/login?mode=signup"
            event="signup_started"
            className="px-3.5 py-1.5 rounded-lg bg-ink text-white text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Start free
          </TrackedLink>
        </div>
      </nav>

      {/* Hero and the sample question are immediately visible, no reveal --
          they're the LCP content and the interactive centerpiece, not
          below-the-fold decoration. Everything after gets the one shared
          fade/slide-up on scroll-into-view (see Reveal.tsx).

          Order (reworked from the original ship): explain the system while
          curiosity from the sample question is highest, then credibility
          (the tutor) lands right after the explanation and before any ask
          -- it used to come after pricing was half-decided. Personalization
          (test date) now sits right before price, once the visitor already
          trusts the plan. "For parents" is folded into Pricing itself
          rather than its own full-height section -- see Pricing.tsx. */}
      <Hero />
      <SampleQuestion />
      <Reveal>
        <HowItWorks />
      </Reveal>
      <Reveal>
        <TutorSection />
      </Reveal>
      <Reveal>
        <TestDatePicker />
      </Reveal>
      {/* Social proof intentionally omitted: no real testimonials exist yet
          to feature, and fabricated ones aren't an option -- add this
          section back once real, permissioned quotes are collected. */}
      <Reveal>
        <Pricing />
      </Reveal>
      <Reveal>
        <Faq />
      </Reveal>
      <Reveal>
        <FinalCta />
      </Reveal>

      <footer className="px-6 py-10 text-center">
        <LegalFooter />
        <div className="text-[11px] text-gray-400 mt-4 max-w-[480px] mx-auto">
          SAT® is a trademark registered by the College Board, which is not affiliated with, and does not endorse,
          this product.
        </div>
      </footer>
    </div>
  );
}
