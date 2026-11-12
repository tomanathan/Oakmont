import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SeoShell, Breadcrumbs, StartFree } from "@/components/seo/SeoShell";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { OG_IMAGES } from "@/components/seo/meta";
import { SITE } from "@/lib/skillPreview";
import { TRIAL_DAYS } from "@/lib/subscription";
import {
  LENGTH_PLANS,
  allPlanSlugs,
  count,
  daysFromToday,
  formatDay,
  lessonsPerWeekText,
  longDate,
  planName,
  planSeoDescription,
  planSeoTitle,
  planSpecForSlug,
  showablePlan,
  upcomingDatePlans,
  weeksAndDays,
  type PublicPlanDay,
  type PublicPlanWeek,
} from "@/lib/publicPlan";
import { OpenAllWeeks } from "../OpenAllWeeks";
import { PrintButton } from "../PrintButton";

// One public page per study plan: a length (2 to 6 months) or an upcoming
// SAT date. Each shows the plan a brand-new student gets, built by the same
// planner as the signed-in plan page (see lib/publicPlan.ts), day by day.
// Rebuilt once a day, since a date plan starts "today" and shrinks as the
// test gets closer. No cookies, no database.

export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return allPlanSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const spec = planSpecForSlug(params.slug);
  const plan = spec ? showablePlan(spec) : null;
  if (!spec || !plan) return {};
  const title = planSeoTitle(spec);
  const description = planSeoDescription(plan);
  const url = `${SITE}/sat-study-plan/${spec.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Oakmont Study Center", type: "article", images: OG_IMAGES },
    twitter: { card: "summary_large_image" },
  };
}

// "practice test 3", "practice tests 2 and 3"
function testsText(numbers: number[]): string {
  if (numbers.length === 1) return `practice test ${numbers[0]}`;
  return `practice tests ${numbers.slice(0, -1).join(", ")} and ${numbers[numbers.length - 1]}`;
}

/** The line in a week's closed header: what the week holds, at a glance. */
function weekSummary(w: PublicPlanWeek): string {
  const parts: string[] = [];
  if (w.lessons > 0) parts.push(count(w.lessons, "lesson"));
  else if (w.reviews > 0) parts.push("review");
  if (w.testNumbers.length > 0) parts.push(testsText(w.testNumbers));
  const text = parts.join(" · ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** A week in plain words, for the ItemList structured data. */
function weekDescription(w: PublicPlanWeek): string {
  const skills = w.days.flatMap((d) => (d.type === "lesson" ? d.skills.map((s) => s.name) : []));
  const parts: string[] = [];
  parts.push(skills.length > 0 ? `Lessons: ${skills.join(", ")}.` : "No new lessons.");
  if (w.reviews > 0) parts.push(`${count(w.reviews, "mixed review day")}.`);
  if (w.testNumbers.length > 0) parts.push(`Official ${testsText(w.testNumbers)}.`);
  if (w.rests > 0) parts.push(`${count(w.rests, "rest day")}.`);
  return parts.join(" ");
}

const H2 = "font-display text-[23px] font-semibold leading-tight text-ink sm:text-[25px]";
const SECTION = "mt-10 scroll-mt-24";
const BODY = "text-[16px] leading-relaxed text-stone-700";
const LINK_ROW =
  "flex min-h-[48px] items-center justify-between gap-3 rounded-xl border border-[#c9d6ee] bg-white px-4 py-2.5 text-[16px] font-semibold text-[#26427e] hover:bg-[#f3f6fc]";
// Weeks shown open before "Open all weeks"; the rest start closed.
const OPEN_WEEKS = 4;

export default function StudyPlanPage({ params }: { params: { slug: string } }) {
  const spec = planSpecForSlug(params.slug);
  if (!spec) notFound();
  const plan = showablePlan(spec);
  // A date that has passed, or too close for a plan this page can show.
  if (!plan) redirect("/sat-study-plan");

  const s = plan.stats;
  const name = planName(spec);
  const url = `${SITE}/sat-study-plan/${spec.slug}`;
  const ctaText = `This is the plan a new student gets. Yours adapts as you go: your practice-test scores move your weakest skills earlier, and it resizes if your test date changes. ${TRIAL_DAYS} days free, no card needed.`;
  const lastWeek = plan.weeks[plan.weeks.length - 1];
  const shortLastWeek = lastWeek.days.length < 7 ? lastWeek.days.length : 0;

  const otherLengths = LENGTH_PLANS.filter((p) => p.slug !== spec.slug)
    .map((p) => ({ spec: p, plan: showablePlan(p) }))
    .filter((p) => p.plan);
  const otherDates = upcomingDatePlans().filter((d) => d.plan && d.slug !== spec.slug);

  return (
    <SeoShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE },
          { name: "SAT study plans", url: `${SITE}/sat-study-plan` },
          { name, url },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${name}, week by week`,
          numberOfItems: plan.weeks.length,
          itemListElement: plan.weeks.map((w) => ({
            "@type": "ListItem",
            position: w.week,
            name: `Week ${w.week}`,
            description: weekDescription(w),
          })),
        }}
      />

      <div className="plan-print">
        <div className="plan-print-hide">
          <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "SAT study plans", href: "/sat-study-plan" }, { name }]} />
        </div>

        <h1 className="font-display text-[30px] font-semibold leading-tight text-ink sm:text-[36px]">{name}</h1>

        {spec.kind === "length" ? (
          <p className="mt-3 text-[18px] leading-relaxed text-ink">
            This is the {spec.months}-month plan a new Oakmont student gets, day by day: {s.weeks} weeks that teach all {plan.skillCount} SAT
            skills, one lesson at a time.
          </p>
        ) : (
          <p className="mt-3 text-[18px] leading-relaxed text-ink">
            The {longDate(spec.date)} SAT is {weeksAndDays(daysFromToday(spec.date))} from today. This is the plan a new Oakmont student gets
            if they start today. It runs every day until the day before the test, in {s.weeks} weeks
            {shortLastWeek ? ` (the last one is ${count(shortLastWeek, "day")} long)` : ""}, and teaches all {plan.skillCount} SAT skills, one
            lesson at a time.
          </p>
        )}
        <p className={`mt-3 ${BODY}`}>
          Along the way there are {s.reviewDays} mixed review days, where you practice everything you&apos;ve learned so far, and {s.tests}{" "}
          full-length practice tests. The practice tests are College Board&apos;s free official ones, taken in the Bluebook app. Oakmont
          schedules them and keeps track of the scores you log. The last week has no new lessons: it&apos;s for review and the final practice
          test.
        </p>
        {spec.kind === "length" && (
          <p className={`mt-3 ${BODY}`}>Days are numbered 1 to 7 because week 1 starts on whatever day you begin.</p>
        )}

        <div className="plan-print-hide">
          <StartFree slim text={ctaText} />
        </div>

        <section className="mt-8" aria-labelledby="weeks">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="weeks" className={H2}>
              Week by week
            </h2>
            <div className="flex flex-wrap gap-2">
              {plan.weeks.length > OPEN_WEEKS && <OpenAllWeeks targetId="plan-weeks" />}
              <PrintButton />
            </div>
          </div>

          <div id="plan-weeks" className="mt-4 flex flex-col gap-3">
            {plan.weeks.map((w, i) => (
              <WeekCard key={w.week} week={w} open={i < OPEN_WEEKS} testCount={plan.testCount} />
            ))}
            {plan.testDate && (
              <div className="plan-week flex gap-3 rounded-xl border border-[#f0e0b0] bg-[#fffaf0] px-4 py-3">
                <div className="w-[5.5rem] flex-none sm:w-[7rem] text-[14px] font-semibold text-stone-600">
                  {formatDay(plan.testDate, { weekday: "short", month: "short", day: "numeric" })}
                </div>
                <div className="min-w-0 flex-1 text-[16px] leading-snug text-ink">
                  <span className="font-semibold text-[#9a6a12]">SAT day.</span> Nothing to study. Good luck!
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="plan-print-hide">
        <StartFree text={ctaText} />

        {otherLengths.length > 0 && (
          <section className={SECTION} aria-labelledby="other-lengths">
            <h2 id="other-lengths" className={H2}>
              Other plan lengths
            </h2>
            <ul className="mt-4 flex flex-col gap-2">
              {otherLengths.map(({ spec: p, plan: op }) => (
                <li key={p.slug}>
                  <Link href={`/sat-study-plan/${p.slug}`} className={LINK_ROW}>
                    <span>
                      {p.months}-month plan
                      <span className="block text-[14px] font-normal text-stone-600">
                        {count(op!.stats.weeks, "week")} · {lessonsPerWeekText(op!.stats)} lessons a week
                      </span>
                    </span>
                    <span aria-hidden>→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {otherDates.length > 0 && (
          <section className={SECTION} aria-labelledby="by-date">
            <h2 id="by-date" className={H2}>
              Plans by test date
            </h2>
            <ul className="mt-4 flex flex-col gap-2">
              {otherDates.map((d) => (
                <li key={d.slug}>
                  <Link href={`/sat-study-plan/${d.slug}`} className={LINK_ROW}>
                    <span>
                      {longDate(d.date)} SAT
                      <span className="block text-[14px] font-normal text-stone-600">{weeksAndDays(d.daysAway)} away</span>
                    </span>
                    <span aria-hidden>→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav aria-label="More" className="mt-8 flex flex-col gap-1 border-t border-[#c9d6ee] pt-5 sm:flex-row sm:flex-wrap sm:gap-x-6">
          <Link href="/sat-study-plan" className="inline-flex min-h-[44px] items-center text-[16px] font-semibold text-[#26427e] underline-offset-4 hover:underline">
            All SAT study plans
          </Link>
          <Link href="/sat-test-dates" className="inline-flex min-h-[44px] items-center text-[16px] font-semibold text-[#26427e] underline-offset-4 hover:underline">
            SAT test dates
          </Link>
          <Link href="/sat" className="inline-flex min-h-[44px] items-center text-[16px] font-semibold text-[#26427e] underline-offset-4 hover:underline">
            All {plan.skillCount} SAT skills
          </Link>
        </nav>
      </div>
    </SeoShell>
  );
}

function WeekCard({ week: w, open, testCount }: { week: PublicPlanWeek; open: boolean; testCount: number }) {
  return (
    <details open={open} className="plan-week group rounded-xl border border-[#c9d6ee] bg-white">
      <summary className="cursor-pointer list-none gap-3 rounded-xl px-4 py-3 hover:bg-[#f3f6fc] [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1">
          <span className="block text-[17px] font-semibold leading-snug text-ink">
            Week {w.week}
            {w.start && w.end && (
              <span className="ml-2 text-[14px] font-normal text-stone-600">
                {formatDay(w.start, { month: "short", day: "numeric" })}
                {w.end !== w.start && <> – {formatDay(w.end, { month: "short", day: "numeric" })}</>}
              </span>
            )}
          </span>
          <span className="block text-[14px] text-stone-600">{weekSummary(w)}</span>
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          aria-hidden="true"
          className="plan-print-hide flex-none text-stone-500 transition-transform duration-200 group-open:rotate-90"
        >
          <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <ol className="divide-y divide-[#eef3fb] border-t border-[#e9effb]">
        {w.days.map((d) => (
          <li key={d.day} className="flex gap-3 px-4 py-2">
            <div className="w-[5.5rem] flex-none sm:w-[7rem] pt-2.5 text-[14px] font-semibold text-stone-600">
              {d.date ? formatDay(d.date, { weekday: "short", month: "short", day: "numeric" }) : `Day ${d.day}`}
            </div>
            <div className="min-w-0 flex-1">
              <DayContent day={d} week={w.week} testCount={testCount} />
            </div>
          </li>
        ))}
      </ol>
    </details>
  );
}

// The same four kinds of day the signed-in plan shows (app/plan/PlanClient.tsx),
// in plain words, with each lesson linking to that skill's public page.
function DayContent({ day, week, testCount }: { day: PublicPlanDay; week: number; testCount: number }) {
  const line = "flex min-h-[44px] items-center text-[16px] leading-snug";
  if (day.type === "lesson") {
    return (
      <ul>
        {day.skills.map((sk) => (
          <li key={sk.id}>
            <Link href={`/sat/${sk.slug}`} className="flex min-h-[44px] flex-col justify-center py-1 underline-offset-4 hover:underline">
              <span className="text-[16px] font-semibold leading-snug text-[#26427e]">{sk.name}</span>
              <span className="text-[14px] text-stone-600">Lesson · {sk.section}</span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }
  if (day.type === "test") {
    return (
      <p className={`${line} font-semibold text-[#9a6a12]`}>
        Official practice test {day.testNumber} of {testCount} in the Bluebook app, then log your scores
      </p>
    );
  }
  if (day.type === "review") {
    return (
      <p className={`${line} text-ink`}>
        {day.weekly ? `Week ${week} review: a longer mixed set on everything so far` : "Mixed review of everything so far"}
      </p>
    );
  }
  return <p className={`${line} text-stone-600`}>Rest, or catch up on a day you missed</p>;
}
