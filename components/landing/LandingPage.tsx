import { LegalFooter } from "@/components/LegalFooter";
import { ALL_SUBSKILLS, ALL_DOMAINS, CURRICULUM } from "@/data/curriculum";
import { landingShowcase } from "@/lib/landingShowcase";
import { QUESTIONS } from "@/data/questions";
import { FAQ_ITEMS } from "@/lib/landingFaq";
import { SampleQuestion } from "./SampleQuestion";
import { Nav, Logo } from "./notebook/Nav";
import { Hero } from "./notebook/Hero";
import { Pitch } from "./notebook/Pitch";
import { Pricing } from "./notebook/Pricing";
import { Faq } from "./notebook/Faq";
import "./notebook/notebook.css";

// The public, logged-out front door at oakmontsat.com (see app/page.tsx --
// signed-in visits redirect before this renders). Server-rendered so the
// pitch, not a login form, is what search engines and shared links see.
//
// "Ozho's Notebook": one long notebook page on a lilac-to-butter desk, with
// the original page's wording and order: title page -> the course and its
// tracking, with the parent dashboard beside it -> one showcase problem,
// taught -> price -> FAQ. Only the poke, the sample question and the
// analytics links ship client JS.
export function LandingPage() {
  const subskillCount = ALL_SUBSKILLS.length;
  const typeCount = ALL_SUBSKILLS.reduce((n, s) => n + s.patterns.length, 0);
  const showcase = landingShowcase();
  const questionCount = Object.values(QUESTIONS).reduce((n, qs) => n + qs.length, 0);

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
    <div className="nb-root" id="top">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="nb-page">
        <div className="nb-spiral" aria-hidden />
        <Nav />
        <main>
          <Hero />
          <Pitch />
          {showcase && (
            <SampleQuestion
              item={showcase}
              questionCount={questionCount}
              sectionCount={CURRICULUM.length}
              domainCount={ALL_DOMAINS.length}
              skillCount={subskillCount}
              typeCount={typeCount}
            />
          )}
          {/* No testimonials section until real, permissioned quotes exist. */}
          <Pricing />
          <Faq />
        </main>
      </div>

      <footer className="nb-foot">
        <div className="nb-foot-row">
          <Logo size="sm" />
          <LegalFooter className="nb-legal" />
        </div>
        <p className="nb-tm">
          SAT® is a trademark registered by the College Board, which is not affiliated with, and does not endorse, this product.
        </p>
      </footer>
    </div>
  );
}
