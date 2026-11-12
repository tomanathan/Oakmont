import type { Metadata } from "next";
import Link from "next/link";
import { CopySnippet } from "@/components/daily/CopySnippet";
import { SeoShell } from "@/components/seo/SeoShell";
import { OG_IMAGES } from "@/components/seo/meta";
import { SITE } from "@/lib/skillPreview";

// How to put the question of the day on another site: a live preview of
// the card (app/embed/daily) and the code to paste. The link line under
// the iframe is part of the code on purpose: a link in the host page
// itself, which a link inside the frame is not.

const PAGE_URL = `${SITE}/daily/embed`;
const TITLE = "Add the SAT Question of the Day to Your Site | Oakmont";
const DESCRIPTION =
  "Put a free SAT question of the day on your website with a few lines of code. A new digital SAT question every day, with full explanations. Free for tutors, teachers and schools.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PAGE_URL, siteName: "Oakmont Study Center", type: "website", images: OG_IMAGES },
  twitter: { card: "summary_large_image" },
};

const SNIPPET = `<iframe src="${SITE}/embed/daily" title="SAT question of the day" width="100%" height="640" style="max-width:440px;border:0" loading="lazy"></iframe>
<p><a href="${SITE}/daily">SAT question of the day</a> from Oakmont SAT Prep</p>`;

const H2 = "font-display text-[23px] font-semibold leading-tight text-ink sm:text-[25px]";

export default function DailyEmbedPage() {
  return (
    <SeoShell>
      <h1 className="font-display text-[30px] font-semibold leading-tight text-ink sm:text-[36px]">Put the SAT question of the day on your site</h1>
      <p className="mt-3 text-[16px] leading-relaxed text-stone-700">
        Tutors, teachers and school sites can show our free SAT question of the day on their own pages. It changes by itself every day, works on
        phones, and students answer it right there and see the full explanation, with no account needed. Paste the code below where you want it to
        appear.
      </p>

      <section className="mt-10" aria-labelledby="preview">
        <h2 id="preview" className={H2}>
          Preview
        </h2>
        <div className="mt-4">
          <iframe
            src="/embed/daily"
            title="SAT question of the day"
            width="100%"
            height="640"
            style={{ maxWidth: 440, border: 0 }}
            loading="lazy"
          />
        </div>
      </section>

      <section className="mt-10" aria-labelledby="code">
        <h2 id="code" className={H2}>
          The code
        </h2>
        <div className="mt-4">
          <CopySnippet code={SNIPPET} label="Code for the SAT question of the day" />
        </div>
      </section>

      <p className="mt-10 border-t border-[#c9d6ee] pt-4 text-[15px]">
        <Link href="/daily" className="inline-flex min-h-[44px] items-center font-semibold text-[#26427e] underline-offset-4 hover:underline">
          ← Today&apos;s SAT question
        </Link>
      </p>
    </SeoShell>
  );
}
