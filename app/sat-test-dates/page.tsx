import type { Metadata } from "next";
import Link from "next/link";
import { SeoShell, Breadcrumbs, StartFree } from "@/components/seo/SeoShell";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { OG_IMAGES } from "@/components/seo/meta";
import { SITE } from "@/lib/skillPreview";
import { TRIAL_DAYS } from "@/lib/subscription";
import { LENGTH_PLANS, count, formatDay, lessonsPerWeekText, longDate, showablePlan, upcomingDatePlans } from "@/lib/publicPlan";
import { DaysAway } from "./DaysAway";

// The upcoming SAT dates the planner offers (lib/satDates.ts) with a
// countdown to each, and a link to that date's study plan. Only the dates
// themselves: deadlines, fees and score dates live on College Board's site,
// which this page links to. Rebuilt once a day; DaysAway keeps the counts
// right in a tab left open.

export const revalidate = 86400;

const COLLEGE_BOARD_DATES = "https://satsuite.collegeboard.org/sat/dates-deadlines";

// A school year runs August to July: "2026–27" for any date in it.
function schoolYear(date: string): string {
  const y = Number(date.slice(0, 4));
  const start = Number(date.slice(5, 7)) >= 8 ? y : y - 1;
  return `${start}–${String(start + 1).slice(2)}`;
}

function schoolYears(dates: string[]): string[] {
  return Array.from(new Set(dates.map(schoolYear)));
}

export function generateMetadata(): Metadata {
  const years = schoolYears(upcomingDatePlans().map((d) => d.date));
  const withYear = years.length === 1 ? `SAT Test Dates and Countdown, ${years[0].replace("–", "-")} | Oakmont` : "";
  const title = withYear && withYear.length <= 60 ? withYear : "SAT Test Dates and Countdown | Oakmont";
  const forYears = years.length > 0 ? ` for ${years.map((y) => y.replace("–", "-")).join(" and ")}` : "";
  const description = `Upcoming SAT test dates${forYears}, with a countdown in days and weeks to each one and a free day-by-day study plan sized to the date you pick.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE}/sat-test-dates` },
    openGraph: { title, description, url: `${SITE}/sat-test-dates`, siteName: "Oakmont Study Center", type: "website", images: OG_IMAGES },
    twitter: { card: "summary_large_image" },
  };
}

const H2 = "font-display text-[25px] font-semibold leading-tight text-ink sm:text-[28px]";
const BODY = "text-[16px] leading-relaxed text-stone-700";
const LINK = "font-semibold text-[#26427e] underline underline-offset-4";

export default function SatTestDatesPage() {
  const dates = upcomingDatePlans();
  const years = schoolYears(dates.map((d) => d.date));
  const lengths = LENGTH_PLANS.flatMap((spec) => {
    const plan = showablePlan(spec);
    return plan ? [{ spec, plan }] : [];
  });

  return (
    <SeoShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE },
          { name: "SAT test dates", url: `${SITE}/sat-test-dates` },
        ])}
      />

      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "SAT test dates" }]} />

      <h1 className="font-display text-[30px] font-semibold leading-tight text-ink sm:text-[36px]">SAT test dates</h1>
      {years.length > 0 && (
        <p className="mt-1 text-[18px] text-stone-600">
          {years.length === 1 ? `${years[0]} school year` : `${years.slice(0, -1).join(", ")} and ${years[years.length - 1]} school years`}
        </p>
      )}
      <p className="mt-3 text-[18px] leading-relaxed text-ink">
        The upcoming digital SAT dates and how far away each one is. Dates far enough out link to a day-by-day study plan for that date.
      </p>

      {dates.length === 0 ? (
        <p className={`mt-6 ${BODY}`}>No upcoming test dates are listed here right now.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-[#c9d6ee] bg-white">
          <table className="w-full border-collapse text-left text-[16px]">
            <caption className="sr-only">Upcoming SAT test dates, with days and weeks from today</caption>
            <thead>
              <tr className="border-b border-[#c9d6ee] bg-[#f3f6fc] text-[14px] text-stone-600">
                <th scope="col" className="px-2.5 py-2.5 font-semibold sm:px-4">
                  Test date
                </th>
                <th scope="col" className="px-2.5 py-2.5 font-semibold sm:px-4">
                  From today
                </th>
                <th scope="col" className="px-2.5 py-2.5 font-semibold sm:px-4">
                  <span className="sr-only">Study plan</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef3fb]">
              {dates.map((d) => (
                <tr key={d.date}>
                  <th scope="row" className="px-2.5 py-2.5 align-top font-normal sm:px-4">
                    <span className="block font-semibold leading-snug text-ink">{longDate(d.date)}</span>
                    <span className="block text-[14px] text-stone-600">{formatDay(d.date, { weekday: "long" })}</span>
                  </th>
                  <td className="px-2.5 py-2.5 align-top tabular-nums sm:px-4">
                    <span className="block leading-snug text-ink">
                      <DaysAway date={d.date} initial={d.daysAway} unit="days" />
                    </span>
                    <span className="block text-[14px] text-stone-600">
                      <DaysAway date={d.date} initial={d.daysAway} unit="weeks" />
                    </span>
                  </td>
                  <td className="px-2.5 py-1 align-middle sm:px-4">
                    {d.plan ? (
                      <Link href={`/sat-study-plan/${d.slug}`} className={`inline-flex min-h-[44px] items-center whitespace-nowrap ${LINK}`}>
                        Study plan
                      </Link>
                    ) : d.daysAway > 0 ? (
                      <Link href="/start" className={`inline-flex min-h-[44px] items-center whitespace-nowrap ${LINK}`}>
                        Start now
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className={`mt-4 ${BODY}`}>
        These are the test dates Oakmont&apos;s planner uses. Registration deadlines and any changes are on{" "}
        <a href={COLLEGE_BOARD_DATES} target="_blank" rel="noopener noreferrer" className={LINK}>
          College Board&apos;s SAT dates page
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        .
      </p>

      <section className="mt-10 scroll-mt-24" aria-labelledby="how-long">
        <h2 id="how-long" className={H2}>
          How long should you study?
        </h2>
        <p className={`mt-3 ${BODY}`}>
          Every plan teaches all {lengths[0]?.plan.skillCount ?? 29} SAT skills and schedules {lengths[0]?.plan.testCount ?? 8} official
          practice tests. A longer plan spreads the lessons out and leaves more days for mixed review. Here is what each one holds:
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {lengths.map(({ spec, plan }) => (
            <li key={spec.slug}>
              <Link
                href={`/sat-study-plan/${spec.slug}`}
                className="flex min-h-[48px] items-center justify-between gap-3 rounded-xl border border-[#c9d6ee] bg-white px-4 py-2.5 hover:bg-[#f3f6fc]"
              >
                <span className="min-w-0">
                  <span className="block text-[16px] font-semibold text-[#26427e]">{spec.months}-month plan</span>
                  <span className="block text-[14px] text-stone-600">
                    {count(plan.stats.weeks, "week")} · {lessonsPerWeekText(plan.stats)} lessons a week ·{" "}
                    {count(plan.stats.reviewDays, "mixed review day")}
                  </span>
                </span>
                <span aria-hidden className="flex-none text-[#26427e]">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className={`mt-4 ${BODY}`}>
          <Link href="/sat-study-plan" className={LINK}>
            All SAT study plans
          </Link>
        </p>
      </section>

      <StartFree text={`Pick your test date and get a plan sized to it. ${TRIAL_DAYS} days free, no card needed.`} />

      <nav aria-label="More" className="mt-2 border-t border-[#c9d6ee] pt-5">
        <Link href="/sat" className="inline-flex min-h-[44px] items-center text-[16px] font-semibold text-[#26427e] underline-offset-4 hover:underline">
          All {lengths[0]?.plan.skillCount ?? 29} SAT skills
        </Link>
      </nav>
    </SeoShell>
  );
}
