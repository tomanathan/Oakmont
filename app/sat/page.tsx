import type { Metadata } from "next";
import Link from "next/link";
import { ALL_DOMAINS, ALL_SUBSKILLS } from "@/data/curriculum";
import { QUESTIONS } from "@/data/questions";
import { SeoShell, Breadcrumbs, StartFree } from "@/components/seo/SeoShell";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { OG_IMAGES } from "@/components/seo/meta";
import { SITE, allSkillSlugs, skillOutline } from "@/lib/skillPreview";
import { slugify } from "@/lib/skillSlugs";
import { sectionTheme } from "@/lib/sectionTheme";
import { TRIAL_DAYS } from "@/lib/subscription";

// The hub for the public skill pages: what's on the digital SAT, and every
// skill by section and subject area, each linking to its own page. Only
// facts the app already states elsewhere; nothing about scores, dates or
// fees. Built once at deploy, like the skill pages.

export const dynamic = "force-static";

const TITLE = `Digital SAT Skills and Question Types: All ${ALL_SUBSKILLS.length} | Oakmont`;
const DESCRIPTION = `Every skill on the digital SAT, by section and subject area: ${ALL_SUBSKILLS.length} skills across Reading and Writing and Math, each with its question types and free practice.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE}/sat` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE}/sat`, siteName: "Oakmont Study Center", type: "website", images: OG_IMAGES },
  twitter: { card: "summary_large_image" },
};

// The two sections' length, as stated above PACE_SECONDS in lib/pace.ts.
const SECTION_FORMAT: Record<string, string> = {
  "Reading and Writing": "54 questions in 64 minutes",
  Math: "44 questions in 70 minutes",
};

const H2 = "font-display text-[25px] font-semibold leading-tight text-ink sm:text-[28px]";
const BODY = "text-[16px] leading-relaxed text-stone-700";

export default function SatHubPage() {
  // Checks every slug against its skill's name, as the skill pages do.
  allSkillSlugs();
  const outline = skillOutline();
  const skillCount = ALL_SUBSKILLS.length;
  const questionCount = Object.values(QUESTIONS).reduce((n, qs) => n + qs.length, 0);

  return (
    <SeoShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE },
          { name: "SAT skills", url: `${SITE}/sat` },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Digital SAT skills",
          numberOfItems: skillCount,
          itemListElement: outline
            .flatMap((sec) => sec.domains.flatMap((d) => d.skills))
            .map((s, i) => ({ "@type": "ListItem", position: i + 1, name: `SAT ${s.name}`, url: `${SITE}/sat/${s.slug}` })),
        }}
      />

      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "SAT skills" }]} />

      <h1 className="font-display text-[30px] font-semibold leading-tight text-ink sm:text-[36px]">What&apos;s on the digital SAT</h1>
      <p className="mt-3 text-[18px] leading-relaxed text-ink">
        The digital SAT has two sections. Reading and Writing is 54 questions in 64 minutes. Math is 44 questions in 70 minutes. You take
        the test in the Bluebook app.
      </p>
      <p className={`mt-3 ${BODY}`}>
        Across the two sections, the test covers {skillCount} skills in {ALL_DOMAINS.length} subject areas. Each skill below has its own
        page with the question types it uses, one of them taught step by step, and 3 practice questions to try.
      </p>

      {outline.map((sec) => {
        const theme = sectionTheme(sec.section);
        const count = sec.domains.reduce((n, d) => n + d.skills.length, 0);
        return (
          <section key={sec.section} id={slugify(sec.section)} className="mt-10 scroll-mt-24" aria-labelledby={`${slugify(sec.section)}-h`}>
            <h2 id={`${slugify(sec.section)}-h`} className={`flex items-center gap-2.5 ${H2}`}>
              <span className={`h-3 w-3 flex-none rounded-full ${theme.dot}`} aria-hidden />
              {sec.section}
            </h2>
            <p className={`mt-1 ${BODY}`}>
              {SECTION_FORMAT[sec.section] ? `${SECTION_FORMAT[sec.section]}. ` : ""}
              {count} skills in {sec.domains.length} subject areas.
            </p>
            {sec.domains.map((d) => (
              <div key={d.domain} className="mt-6">
                <h3 className={`text-[14px] font-semibold uppercase tracking-wide ${theme.text}`}>{d.domain}</h3>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {d.skills.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/sat/${s.slug}`}
                        className="block rounded-xl border border-[#c9d6ee] bg-white px-4 py-3.5 shadow-[3px_3px_0_rgba(52,97,193,0.13)] hover:bg-[#f3f6fc]"
                      >
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="text-[17px] font-semibold leading-snug text-[#26427e] underline-offset-4">{s.name}</span>
                          <span className="flex-none text-[13px] text-stone-500">
                            {s.typeCount === 1 ? "1 question type" : `${s.typeCount} question types`}
                          </span>
                        </span>
                        <span className={`mt-1 block ${BODY}`}>{s.blurb}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        );
      })}

      <StartFree
        text={`Get every lesson, all ${questionCount} practice questions, and a study plan sized to your test date. ${TRIAL_DAYS} days free, no card needed.`}
      />
    </SeoShell>
  );
}
