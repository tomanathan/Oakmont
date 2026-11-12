import type { Metadata } from "next";
import Link from "next/link";
import { ALL_SUBSKILLS } from "@/data/curriculum";
import { DailyQuestion } from "@/components/daily/DailyQuestion";
import { dailyDateLabel, dailyNumberAt } from "@/components/daily/day";
import { DifficultyPill } from "@/components/seo/DifficultyPill";
import { SeoShell, StartFree } from "@/components/seo/SeoShell";
import { JsonLd, quizJsonLd } from "@/components/seo/JsonLd";
import { OG_IMAGES } from "@/components/seo/meta";
import { dailyQuestion, toPracticeQuestion } from "@/lib/dailyQuestion";
import { SITE } from "@/lib/skillPreview";
import { sectionTheme } from "@/lib/sectionTheme";
import { TRIAL_DAYS } from "@/lib/subscription";

// The SAT question of the day: one new question every day, the same for
// everyone, to answer here without an account (which one is decided in
// lib/dailyQuestion.ts). Rendered on the server so the question is in the
// page for search engines, and rebuilt at most every five minutes, so a
// new day's question is up within minutes of midnight in New York. No
// cookies, no database.

export const revalidate = 300;

const PAGE_URL = `${SITE}/daily`;
const TITLE = "SAT Question of the Day | Oakmont";
const DESCRIPTION =
  "A free digital SAT practice question every day, with a full explanation. Answer today's in a minute, keep your streak going, and come back tomorrow for a new one.";

export function generateMetadata(): Metadata {
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: PAGE_URL },
    openGraph: { title: TITLE, description: DESCRIPTION, url: PAGE_URL, siteName: "Oakmont Study Center", type: "website", images: OG_IMAGES },
    twitter: { card: "summary_large_image" },
  };
}

const LINK = "inline-flex min-h-[44px] items-center font-semibold text-[#26427e] underline underline-offset-4";

export default function DailyPage() {
  // Before launch day, day 1 is shown early.
  const day = Math.max(1, dailyNumberAt(new Date()));
  const pick = dailyQuestion(day);
  const question = toPracticeQuestion(pick.item);
  const { skill } = pick;
  const theme = sectionTheme(skill.section);
  const quiz = quizJsonLd({ skill: skill.name, section: skill.section, url: PAGE_URL, questions: [question] });

  return (
    <SeoShell>
      <JsonLd data={{ ...quiz, name: `SAT question of the day #${day}` }} />

      <p className="text-[13px] font-semibold uppercase tracking-wide text-[#2a4f9f]">
        SAT question of the day · #{day} · {dailyDateLabel(day)}
      </p>
      <h1 className="mt-2 font-display text-[30px] font-semibold leading-tight text-ink sm:text-[36px]">Today&apos;s SAT question</h1>
      <p className="mt-3 text-[16px] leading-relaxed text-stone-700">
        A new digital SAT question every day, free. Pick an answer to see how you did and why.
      </p>
      <p className="mt-2 flex flex-wrap items-center gap-x-2 text-[16px] text-stone-700">
        <span className={`h-2 w-2 flex-none rounded-full ${theme.dot}`} aria-hidden />
        <span>{skill.section}:</span>
        <Link href={`/sat/${skill.slug}`} className={LINK}>
          {skill.name}
        </Link>
        <DifficultyPill difficulty={question.difficulty} />
      </p>

      <div className="mt-3">
        <DailyQuestion
          day={day}
          question={question}
          after={
            <>
              <StartFree
                text={`Want the lesson behind this question? Get every lesson, all the practice questions and a study plan sized to your test date. ${TRIAL_DAYS} days free, no card needed.`}
              />
              <p className="-mt-4 text-[16px] leading-relaxed text-stone-600">
                Or read about{" "}
                <Link href={`/sat/${skill.slug}`} className={LINK}>
                  {skill.name}
                </Link>{" "}
                for free, or see{" "}
                <Link href="/sat" className={LINK}>
                  all {ALL_SUBSKILLS.length} SAT skills
                </Link>
                .
              </p>
            </>
          }
        />
      </div>

      <p className="mt-10 border-t border-[#c9d6ee] pt-4 text-[16px] text-stone-600">
        <Link href="/daily/embed" className="inline-flex min-h-[44px] items-center font-medium text-[#26427e] underline-offset-4 hover:underline">
          Put this on your site
        </Link>
      </p>
    </SeoShell>
  );
}
