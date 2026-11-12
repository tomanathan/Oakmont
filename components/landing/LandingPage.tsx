import { LegalFooter } from "@/components/LegalFooter";
import { ALL_SUBSKILLS, ALL_DOMAINS, CURRICULUM } from "@/data/curriculum";
import { landingShowcase } from "@/lib/landingShowcase";
import { QUESTIONS } from "@/data/questions";
import { FAQ_ITEMS } from "@/lib/landingFaq";
import { SampleQuestion } from "./SampleQuestion";
import { Nav, Logo } from "./notebook/Nav";
import { Hero } from "./notebook/Hero";
import { Pitch } from "./notebook/Pitch";
import { Pricing, loadPlanPricesSafely } from "./notebook/Pricing";
import { Faq } from "./notebook/Faq";
import "./notebook/notebook.css";

const SITE = "https://oakmontsat.com";

// The public, logged-out front door at oakmontsat.com (see app/page.tsx --
// signed-in visits redirect before this renders). Server-rendered so the
// pitch, not a login form, is what search engines and shared links see.
//
// "Ozho's Notebook": one long notebook page on a lilac-to-butter desk, with
// the original page's wording and order: title page -> the course and its
// tracking, with the parent dashboard beside it -> one showcase problem,
// taught -> price -> FAQ. Only the poke, the sample question and the
// analytics links ship client JS.
export async function LandingPage() {
  const subskillCount = ALL_SUBSKILLS.length;
  const typeCount = ALL_SUBSKILLS.reduce((n, s) => n + s.patterns.length, 0);
  const showcase = landingShowcase();
  const questionCount = Object.values(QUESTIONS).reduce((n, qs) => n + qs.length, 0);
  const prices = await loadPlanPricesSafely();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Oakmont Study Center",
    url: SITE,
    logo: `${SITE}/oakmont-mark.png`,
  };

  // The two plans at the prices Stripe actually charges (the same ones the
  // pricing section shows). Left out when the prices couldn't be read. No
  // ratings or reviews: there are none to report.
  const offer = (name: string, p: { amountCents: number; currency: string }) => ({
    "@type": "Offer",
    name,
    price: (p.amountCents / 100).toFixed(2),
    priceCurrency: p.currency.toUpperCase(),
    url: `${SITE}/#pricing`,
  });
  const productJsonLd =
    prices && prices.monthly.amountCents > 0 && prices.sixmonth.amountCents > 0
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Oakmont SAT prep course",
          description: `A week-by-week SAT study plan covering all ${subskillCount} official SAT skills, with lessons, practice quizzes and a parent dashboard.`,
          brand: { "@type": "Organization", name: "Oakmont Study Center" },
          image: `${SITE}/oakmont-mark.png`,
          offers: [offer("Monthly", prices.monthly), offer("6-month pass", prices.sixmonth)],
        }
      : null;

  return (
    <div className="nb-root" id="top">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      {productJsonLd && (
        // eslint-disable-next-line react/no-danger
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      )}

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
          <Pricing prices={prices} />
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
