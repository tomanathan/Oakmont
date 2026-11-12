import type { Metadata } from "next";
import { DailyQuestion } from "@/components/daily/DailyQuestion";
import { dailyNumberAt } from "@/components/daily/day";
import { DifficultyPill } from "@/components/seo/DifficultyPill";
import { dailyQuestion, toPracticeQuestion } from "@/lib/dailyQuestion";

// The question of the day as a small card for other sites to put on their
// pages in an iframe (the code is on /daily/embed). Only paths under
// /embed may be framed by other sites (see next.config.mjs). No site
// header or footer; around the card the host page shows through (the
// .daily-embed rule in globals.css). Built like /daily, rebuilt at most
// every five minutes. Every link opens our site in a new tab, never inside
// the frame.

export const revalidate = 300;

export const metadata: Metadata = {
  title: "SAT Question of the Day | Oakmont",
  robots: { index: false },
};

const SITE_LINK = "https://oakmontsat.com/daily?utm_source=embed";

export default function EmbedDaily() {
  const day = Math.max(1, dailyNumberAt(new Date()));
  const pick = dailyQuestion(day);
  const question = toPracticeQuestion(pick.item);

  return (
    <main className="daily-embed seo-read mx-auto w-full max-w-[440px] p-1.5 font-sans">
      <div className="min-w-0 break-words rounded-2xl border-2 border-[#3461c1] bg-[#fffdf7] p-3.5 shadow-[3px_3px_0_#3461c1] sm:p-4">
        <h1 className="text-[12px] font-semibold uppercase tracking-wide text-[#2a4f9f]">SAT question of the day · #{day}</h1>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-[15px] text-stone-600">
          {pick.skill.name}
          <DifficultyPill difficulty={question.difficulty} />
        </p>
        <div className="mt-3">
          <DailyQuestion
            day={day}
            question={question}
            compact
            after={
              <a
                href={SITE_LINK}
                target="_blank"
                rel="noopener"
                className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-forest px-6 text-[16px] font-semibold text-white transition-colors hover:bg-[#1f2f5a]"
              >
                More free practice
              </a>
            }
          />
        </div>
        <p className="mt-3 border-t border-[#d9e2f4] pt-1 text-right">
          <a
            href={SITE_LINK}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-[44px] items-center text-[14px] font-semibold text-[#26427e] underline-offset-4 hover:underline"
          >
            Oakmont SAT Prep
          </a>
        </p>
      </div>
    </main>
  );
}
