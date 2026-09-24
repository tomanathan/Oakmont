import { BrandMark } from "@/components/BrandMark";
import { LegalFooter } from "@/components/LegalFooter";
import { ALL_SUBSKILLS } from "@/data/curriculum";
import { QUESTIONS } from "@/data/questions";
import { FAQ_ITEMS } from "@/lib/landingFaq";
import { Hero } from "./Hero";
import { ProofStrip } from "./ProofStrip";
import { SampleQuestion } from "./SampleQuestion";
import { ParentsSection } from "./ParentsSection";
import { HowItWorks } from "./HowItWorks";
import { Features } from "./Features";
import { TutorSection } from "./TutorSection";
import { Pricing } from "./Pricing";
import { Faq } from "./Faq";
import { FinalCta } from "./FinalCta";
import { Reveal } from "./Reveal";
import { TrackedLink } from "./TrackedLink";

// The public, logged-out front door at oakmontsat.com (see app/page.tsx --
// signed-in visits redirect before this renders). Server-rendered so the
// pitch, not a login form, is what search engines and shared links see.
//
// Story order: promise (hero) -> proof it's real (numbers, a live question)
// -> what parents get (often the ones deciding) -> how the plan works ->
// everything that's inside, including why there are dogs -> who built it
// -> price -> objections -> ask again.
export function LandingPage() {
  const questionCount = Object.values(QUESTIONS).reduce((n, qs) => n + qs.length, 0);
  const subskillCount = ALL_SUBSKILLS.length;

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

      <nav className="sticky top-0 z-30 border-b border-[#ece9f7]/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="#top" className="flex min-w-0 items-center gap-2">
            <BrandMark size={26} className="flex-shrink-0" />
            <span className="hidden truncate font-display text-[15px] font-semibold sm:inline">Oakmont Study Center</span>
          </a>
          <div className="hidden items-center gap-7 text-sm text-gray-500 md:flex">
            <a href="#parents" className="font-medium text-[#4a5bb0] transition-colors hover:text-ink">
              For parents
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-ink">
              How it works
            </a>
            <a href="#inside" className="transition-colors hover:text-ink">
              What&apos;s inside
            </a>
            <a href="#pricing" className="transition-colors hover:text-ink">
              Pricing
            </a>
            <a href="#faq" className="transition-colors hover:text-ink">
              FAQ
            </a>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
            <a href="#parents" className="rounded-lg px-2 py-1.5 text-sm font-medium text-[#4a5bb0] md:hidden">
              Parents
            </a>
            <a href="/login" className="rounded-lg px-3 py-1.5 text-sm text-gray-600 transition-colors hover:text-ink">
              Log in
            </a>
            <TrackedLink
              href="/login?mode=signup"
              event="signup_started"
              className="whitespace-nowrap rounded-lg bg-ink px-3.5 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Start free
            </TrackedLink>
          </div>
        </div>
      </nav>

      <main id="top">
        <Hero questionCount={questionCount} subskillCount={subskillCount} />
        <ProofStrip questionCount={questionCount} subskillCount={subskillCount} />
        <SampleQuestion questionCount={questionCount} />
        <ParentsSection />
        <Reveal>
          <HowItWorks subskillCount={subskillCount} />
        </Reveal>
        <Reveal>
          <Features subskillCount={subskillCount} />
        </Reveal>
        <Reveal>
          <TutorSection />
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
