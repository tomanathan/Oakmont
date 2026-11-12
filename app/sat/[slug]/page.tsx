import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MathText } from "@/components/MathText";
import { PassageText } from "@/components/PassageText";
import { ProseText, StepList } from "@/components/StepList";
import { GeometryDiagram } from "@/components/GeometryDiagram";
import { SkillPractice } from "@/components/seo/SkillPractice";
import { DifficultyPill } from "@/components/seo/DifficultyPill";
import { SeoShell, Breadcrumbs, StartFree } from "@/components/seo/SeoShell";
import { JsonLd, breadcrumbJsonLd, quizJsonLd } from "@/components/seo/JsonLd";
import { OG_IMAGES } from "@/components/seo/meta";
import { SITE, allSkillSlugs, seoDescription, seoTitle, skillPreview, type SkillPreview } from "@/lib/skillPreview";
import { subskillIdForSlug, slugify } from "@/lib/skillSlugs";
import { sectionTheme } from "@/lib/sectionTheme";
import { TRIAL_DAYS } from "@/lib/subscription";

// One free preview page per SAT skill, for people searching for that skill:
// the names of its question types, one of them taught in full with a worked
// example, three practice questions to answer here, and two tips. What it
// may show is decided in lib/skillPreview.ts. Built once at deploy (no
// cookies, no database), so it is served as a static file.

export const dynamicParams = false;
export const dynamic = "force-static";

export function generateStaticParams() {
  return allSkillSlugs().map((slug) => ({ slug }));
}

function previewFor(slug: string): SkillPreview | null {
  const id = subskillIdForSlug(slug);
  return id ? skillPreview(id) : null;
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = previewFor(params.slug);
  if (!p) return {};
  const title = seoTitle(p.name);
  const description = seoDescription(p.name, p.types.map((t) => t.name));
  const url = `${SITE}/sat/${p.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Oakmont Study Center", type: "article", images: OG_IMAGES },
    twitter: { card: "summary_large_image" },
  };
}

const H2 = "font-display text-[23px] font-semibold leading-tight text-ink sm:text-[25px]";
const SECTION = "mt-10 scroll-mt-24";
const BODY = "text-[16px] leading-relaxed text-stone-700";

export default function SkillPage({ params }: { params: { slug: string } }) {
  const p = previewFor(params.slug);
  if (!p) notFound();

  const url = `${SITE}/sat/${p.slug}`;
  const sectionHref = `/sat#${slugify(p.section)}`;
  const theme = sectionTheme(p.section);
  const n = p.types.length;
  const ex = p.featured.example;
  const easyMediumHard = p.practice.map((q) => q.difficulty).join() === "easy,medium,hard";
  const ctaText = `Get the full lesson, all ${p.totalQuestions} practice questions for this skill, and a study plan sized to your test date. ${TRIAL_DAYS} days free, no card needed.`;

  return (
    <SeoShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "SAT skills", url: `${SITE}/sat` },
          { name: p.section, url: `${SITE}${sectionHref}` },
          { name: p.name, url },
        ])}
      />
      <JsonLd data={quizJsonLd({ skill: p.name, section: p.section, url, questions: p.practice })} />

      <Breadcrumbs items={[{ name: "SAT skills", href: "/sat" }, { name: p.section, href: sectionHref }, { name: p.name }]} />

      <p className={`flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide ${theme.text}`}>
        <span className={`h-2 w-2 flex-none rounded-full ${theme.dot}`} aria-hidden />
        {p.section} · {p.domain}
      </p>
      <h1 className="mt-2 font-display text-[30px] font-semibold leading-tight text-ink sm:text-[36px]">SAT {p.name}</h1>
      <p className="mt-3 text-[18px] leading-relaxed text-ink">{p.blurb}</p>
      <p className={`mt-3 ${BODY}`}>
        {p.name} is one of the {p.skillCount} skills on the digital SAT. It&apos;s part of {p.domain}, in the {p.section} section.{" "}
        {n === 1
          ? "Below is the question type it uses, taught step by step, and 3 practice questions you can try right here."
          : `Below are its ${n} question types, one of them taught step by step, and 3 practice questions you can try right here.`}
      </p>

      <StartFree slim text={`The full lesson and a study plan sized to your test date. ${TRIAL_DAYS} days free, no card needed.`} />

      <section className={SECTION} aria-labelledby="types">
        <h2 id="types" className={H2}>
          {n === 1 ? "The question type" : `The ${n} question types`}
        </h2>
        <ol className="mt-4 flex flex-col gap-3">
          {p.types.map((t, i) => (
            <li key={t.name} className="flex gap-3 rounded-xl border border-[#c9d6ee] bg-white px-4 py-3.5">
              <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-[#e9effb] text-[13px] font-bold text-[#26427e]" aria-hidden>
                {i + 1}
              </span>
              <div className="min-w-0">
                <h3 className="text-[17px] font-semibold leading-snug text-ink">{t.name}</h3>
                <p className={`mt-1 ${BODY}`}>
                  <MathText text={t.teaser} />
                </p>
                {i === p.featured.index && (
                  <a href="#how-to-answer" className="inline-flex min-h-[44px] items-center text-[15px] font-semibold text-[#26427e] underline underline-offset-4">
                    Taught in full below
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={SECTION} aria-labelledby="how-to-answer">
        <h2 id="how-to-answer" className={H2}>
          How to answer: {p.featured.name}
        </h2>
        <ProseText text={p.featured.explanation} className={`mt-4 ${BODY}`} />
      </section>

      <section className={SECTION} aria-labelledby="worked-example">
        <h2 id="worked-example" className={H2}>
          Worked example
        </h2>
        <div className="mt-4 rounded-xl bg-[#f3f6fc] p-4 sm:p-5">
          <div className="mb-3 flex justify-end">
            <DifficultyPill difficulty={ex.difficulty} />
          </div>
          <div className="mb-4 min-w-0 text-[16px] text-ink">
            <PassageText text={ex.q} highlight={ex.underline} figure={ex.figure} />
          </div>
          {ex.diagram && <GeometryDiagram spec={ex.diagram} />}
          {/* Already worked: the right choice is marked, the way the lesson
              shows it once an example is solved. */}
          <ol className="flex flex-col gap-2" aria-label="Answer choices">
            {ex.choices.map((choice, ci) => {
              const isAnswer = ci === ex.answer;
              return (
                <li
                  key={ci}
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-[16px] leading-snug text-ink shadow-[3px_3px_0_rgba(52,97,193,0.13)] ${
                    isAnswer ? "border-accent bg-[#edf6f0] ring-1 ring-accent" : "border-[#d9ceb7] bg-white"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 flex-none items-center justify-center rounded-lg text-[13px] font-bold ${
                      isAnswer ? "bg-accent text-white" : "bg-[#e9effb] text-[#26427e]"
                    }`}
                    aria-hidden
                  >
                    {isAnswer ? "✓" : String.fromCharCode(65 + ci)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="sr-only">
                      {String.fromCharCode(65 + ci)}. {isAnswer ? "(the answer) " : ""}
                    </span>
                    <MathText text={choice} />
                  </span>
                </li>
              );
            })}
          </ol>
          <div className="mt-4 border-t border-[#c9d6ee] pt-4">
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-accent">{String.fromCharCode(65 + ex.answer)} is right</div>
            <StepList text={ex.explain} className={BODY} />
          </div>
        </div>
      </section>

      <section className={SECTION} aria-labelledby="traps">
        <h2 id="traps" className={H2}>
          Traps to watch
        </h2>
        <ul className="mt-4 flex flex-col gap-2.5 rounded-xl border border-[#f6dede] bg-[#fdf2f2] p-4">
          {p.featured.traps.map((t) => (
            <li key={t} className={`flex gap-2.5 ${BODY}`}>
              <span className="flex-none text-[#d97f7e]" aria-hidden>
                &#9679;
              </span>
              <span className="min-w-0">
                <MathText text={t} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={SECTION} aria-labelledby="practice">
        <h2 id="practice" className={H2}>
          Try 3 practice questions
        </h2>
        <p className={`mt-2 mb-4 ${BODY}`}>
          {easyMediumHard ? "One easy, one medium, one hard. Pick an answer to check it." : "Pick an answer to check it."}
        </p>
        <SkillPractice questions={p.practice} />
      </section>

      <section className={SECTION} aria-labelledby="tips">
        <h2 id="tips" className={H2}>
          Two quick tips
        </h2>
        <ul className="mt-4 flex flex-col gap-3 rounded-xl border border-[#d9e2f4] bg-[#fffaf0] p-4">
          {p.tips.map((t) => (
            <li key={t} className={`border-b border-[#d9e2f4] pb-3 last:border-b-0 last:pb-0 ${BODY}`}>
              <MathText text={t} />
            </li>
          ))}
        </ul>
      </section>

      <StartFree text={ctaText} />

      {p.siblings.length > 0 && (
        <section className={SECTION} aria-labelledby="more">
          <h2 id="more" className={H2}>
            More {p.domain} skills
          </h2>
          <ul className="mt-4 flex flex-col gap-2">
            {p.siblings.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/sat/${s.slug}`}
                  className="flex min-h-[48px] items-center justify-between gap-3 rounded-xl border border-[#c9d6ee] bg-white px-4 py-2.5 text-[16px] font-semibold text-[#26427e] hover:bg-[#f3f6fc]"
                >
                  SAT {s.name}
                  <span aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav aria-label="Previous and next skill" className="mt-8 flex flex-col gap-2 border-t border-[#c9d6ee] pt-5 sm:flex-row sm:justify-between">
        {p.prev ? (
          <Link href={`/sat/${p.prev.slug}`} className="inline-flex min-h-[44px] items-center text-[15px] font-semibold text-[#26427e] underline-offset-4 hover:underline">
            ← Previous skill: {p.prev.name}
          </Link>
        ) : (
          <span />
        )}
        {p.next ? (
          <Link href={`/sat/${p.next.slug}`} className="inline-flex min-h-[44px] items-center text-[15px] font-semibold text-[#26427e] underline-offset-4 hover:underline sm:text-right">
            Next skill: {p.next.name} →
          </Link>
        ) : (
          <Link href="/sat" className="inline-flex min-h-[44px] items-center text-[15px] font-semibold text-[#26427e] underline-offset-4 hover:underline sm:text-right">
            All {p.skillCount} SAT skills →
          </Link>
        )}
      </nav>
    </SeoShell>
  );
}
