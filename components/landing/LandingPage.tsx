import { LegalFooter } from "@/components/LegalFooter";
import { PixelDog } from "@/components/PixelDog";
import { ALL_SUBSKILLS, ALL_DOMAINS, CURRICULUM } from "@/data/curriculum";
import { landingShowcase } from "@/lib/landingShowcase";
import { QUESTIONS } from "@/data/questions";
import { FAQ_ITEMS } from "@/lib/landingFaq";
import { SampleQuestion } from "./SampleQuestion";
import { TrackedLink } from "./TrackedLink";
import { Nav, Logo } from "./notebook/Nav";
import { Hero } from "./notebook/Hero";
import { HowItWorks } from "./notebook/HowItWorks";
import { ForParents } from "./notebook/ForParents";
import { Pricing } from "./notebook/Pricing";
import { Faq } from "./notebook/Faq";
import { C, Tape } from "./notebook/art";
import "./notebook/notebook.css";

// The public, logged-out front door at oakmontsat.com (see app/page.tsx --
// signed-in visits redirect before this renders). Server-rendered so the
// pitch, not a login form, is what search engines and shared links see.
//
// "Ozho's Notebook": one long notebook page on a lilac-to-butter desk.
// Three layers (see the notebook.css header): the world (Ozho's room),
// plain paper content (the sample question, pricing, FAQ) and the reward
// stickers (the costume closet). Only the poke, the sample question and
// the analytics links ship client JS.
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
          <HowItWorks />
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
          <ForParents />
          {/* No testimonials section until real, permissioned quotes exist. */}
          <Pricing />
          <Faq />

          <section className="nb-final" aria-labelledby="nb-final-h">
            <Tape color={C.cyan} pattern="grid" className="nb-final-tape" />
            <div className="nb-final-copy">
              <h2 id="nb-final-h" className="nb-h2 nb-h2--md">
                Start with five questions.
              </h2>
              <p className="nb-body">No account and no card. If you like it, the plan is ready when you are.</p>
              <TrackedLink href="/start" event="signup_started" className="nb-cta">
                <span className="nb-cta-in">
                  <b>Try 5 SAT questions</b>
                  <small>no signup · about 5 minutes</small>
                </span>
                <span className="nb-cta-arrow" aria-hidden>
                  →
                </span>
              </TrackedLink>
            </div>
            <div className="nb-final-dog" aria-hidden>
              <PixelDog size={150} mood="happy" sitting costume="sunglasses" shadow={false} />
            </div>
          </section>
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
