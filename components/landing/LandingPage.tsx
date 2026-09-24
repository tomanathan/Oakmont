import { BrandMark } from "@/components/BrandMark";
import { LegalFooter } from "@/components/LegalFooter";
import { ALL_SUBSKILLS, ALL_DOMAINS } from "@/data/curriculum";
import { landingQuestions } from "@/lib/landingQuestions";
import { QUESTIONS } from "@/data/questions";
import { FAQ_ITEMS } from "@/lib/landingFaq";
import { Hero } from "./Hero";
import { ProofStrip } from "./ProofStrip";
import { SampleQuestion } from "./SampleQuestion";
import { ParentsSection } from "./ParentsSection";
import { HowItWorks } from "./HowItWorks";
import { Pricing } from "./Pricing";
import { Faq } from "./Faq";
import { FinalCta } from "./FinalCta";
import { Reveal } from "./Reveal";
import { TrackedLink } from "./TrackedLink";

// The public, logged-out front door at oakmontsat.com (see app/page.tsx --
// signed-in visits redirect before this renders). Server-rendered so the
// pitch, not a login form, is what search engines and shared links see.
//
// Story order, kept short on purpose: promise (hero) -> what parents get
// (often the ones deciding) -> a live question -> how the plan works and
// who built it -> price -> objections -> ask again.
export function LandingPage() {
  const questionCount = Object.values(QUESTIONS).reduce((n, qs) => n + qs.length, 0);
  const subskillCount = ALL_SUBSKILLS.length;
  const typeCount = ALL_SUBSKILLS.reduce((n, s) => n + s.patterns.length, 0);
  const sampleQuestions = landingQuestions();

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
    <div className="font-sans text-ink">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Brand centered, Khan Academy style: page links on the left, account
          actions on the right, the mark between them. */}
      <nav className="sticky top-0 z-30 border-b border-[#ece9f7]/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto grid max-w-[1120px] grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6">
          <div className="flex min-w-0 items-center">
            <div className="hidden items-center gap-6 whitespace-nowrap text-[15px] text-gray-500 lg:flex xl:gap-8 xl:text-[16px]">
              <a href="#parents" className="font-medium text-pastelInk-lilac transition-colors hover:text-ink">
                For parents
              </a>
              <a href="#how-it-works" className="transition-colors hover:text-ink">
                How it works
              </a>
              <a href="#pricing" className="transition-colors hover:text-ink">
                Pricing
              </a>
              <a href="#faq" className="transition-colors hover:text-ink">
                FAQ
              </a>
            </div>
            <a href="#parents" className="-ml-1 rounded-lg px-1 py-1.5 text-[14px] font-medium text-pastelInk-lilac sm:text-[15px] lg:hidden">
              Parents
            </a>
          </div>
          <a href="#top" className="flex items-center justify-center gap-2.5" aria-label="Oakmont Study Center, back to top">
            <BrandMark size={40} className="flex-shrink-0" />
            <span className="hidden whitespace-nowrap font-display text-[21px] font-semibold tracking-[-0.01em] sm:inline">Oakmont Study Center</span>
          </a>
          <div className="flex items-center justify-end gap-1 sm:gap-3">
            <a href="/login" className="rounded-lg px-2 py-2 text-[14px] text-gray-600 transition-colors hover:text-ink sm:px-3 sm:text-[16px]">
              Log in
            </a>
            <TrackedLink
              href="/login?mode=signup"
              event="signup_started"
              className="whitespace-nowrap rounded-lg bg-ink px-3 py-2 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 sm:px-4 sm:text-[16px]"
            >
              Start free
            </TrackedLink>
          </div>
        </div>
      </nav>

      <main id="top">
        <Hero questionCount={questionCount} subskillCount={subskillCount} />
        <ProofStrip questionCount={questionCount} subskillCount={subskillCount} />
        <ParentsSection />
        <SampleQuestion questionCount={questionCount} questions={sampleQuestions} subskillCount={subskillCount} domainCount={ALL_DOMAINS.length} typeCount={typeCount} />
        <Reveal>
          <HowItWorks subskillCount={subskillCount} />
        </Reveal>
        {/* No testimonials section until real, permissioned quotes exist. */}
        <Reveal>
          <Pricing />
        </Reveal>
        <Reveal>
          <Faq />
        </Reveal>
        <FinalCta />
      </main>

      <footer className="border-t border-[#ece9f7] bg-white">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <BrandMark size={22} />
            <span className="font-display text-sm font-semibold">Oakmont Study Center</span>
          </div>
          <LegalFooter className="sm:justify-end" />
        </div>
        <p className="mx-auto max-w-[1120px] px-6 pb-10 text-[11px] leading-relaxed text-gray-400">
          SAT® is a trademark registered by the College Board, which is not affiliated with, and does not endorse, this
          product.
        </p>
      </footer>
    </div>
  );
}
