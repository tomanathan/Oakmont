import type { Metadata } from "next";
import Link from "next/link";
import { SeoShell, Breadcrumbs, StartFree } from "@/components/seo/SeoShell";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { OG_IMAGES } from "@/components/seo/meta";
import { SITE } from "@/lib/skillPreview";
import { TRIAL_DAYS } from "@/lib/subscription";
import {
  LENGTH_PLANS,
  count,
  formatDay,
  lessonsPerWeekText,
  longDate,
  planName,
  showablePlan,
  upcomingDatePlans,
  weeksAndDays,
} from "@/lib/publicPlan";

// The hub for the public study plans: one card per upcoming SAT date that
// a plan can be shown for, then the plans by length. Rebuilt once a day so
// the weeks left stay current and dates drop off once they pass.

export const revalidate = 86400;

const TITLE = "SAT Study Plans by Test Date and Length | Oakmont";

function description(skillCount: number, tests: number): string {
  const shortest = LENGTH_PLANS[0].months;
  const longest = LENGTH_PLANS[LENGTH_PLANS.length - 1].months;
  return `Free day-by-day SAT study plans: pick your test date or a length from ${shortest} to ${longest} months. Each one covers all ${skillCount} skills and schedules ${tests} official practice tests.`;
}

function lengthPlans() {
  return LENGTH_PLANS.flatMap((spec) => {
    const plan = showablePlan(spec);
    return plan ? [{ spec, plan }] : [];
  });
}

export function generateMetadata(): Metadata {
  const any = lengthPlans()[0]?.plan;
  const desc = description(any?.skillCount ?? 29, any?.testCount ?? 8);
  return {
    title: TITLE,
    description: desc,
    alternates: { canonical: `${SITE}/sat-study-plan` },
    openGraph: { title: TITLE, description: desc, url: `${SITE}/sat-study-plan`, siteName: "Oakmont Study Center", type: "website", images: OG_IMAGES },
    twitter: { card: "summary_large_image" },
  };
}

const H2 = "font-display text-[25px] font-semibold leading-tight text-ink sm:text-[28px]";
const BODY = "text-[16px] leading-relaxed text-stone-700";
const CARD =
  "flex min-h-[48px] items-center justify-between gap-3 rounded-xl border border-[#c9d6ee] bg-white px-4 py-3.5 shadow-[3px_3px_0_rgba(52,97,193,0.13)] hover:bg-[#f3f6fc]";

export default function StudyPlansHubPage() {
  const dates = upcomingDatePlans();
  const lengths = lengthPlans();
  const sample = lengths[0]?.plan;
  const skillCount = sample?.skillCount ?? 29;
  const testCount = sample?.testCount ?? 8;

  const listed = [
    ...dates.filter((d) => d.plan).map((d) => ({ name: planName({ kind: "date", slug: d.slug, date: d.date }), slug: d.slug })),
    ...lengths.map((l) => ({ name: planName(l.spec), slug: l.spec.slug })),
  ];

  return (
    <SeoShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE },
          { name: "SAT study plans", url: `${SITE}/sat-study-plan` },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "SAT study plans",
          numberOfItems: listed.length,
          itemListElement: listed.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name, url: `${SITE}/sat-study-plan/${p.slug}` })),
        }}
      />

      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "SAT study plans" }]} />

      <h1 className="font-display text-[30px] font-semibold leading-tight text-ink sm:text-[36px]">SAT study plans</h1>
      <p className="mt-3 text-[18px] leading-relaxed text-ink">
        Each plan here is the real plan Oakmont builds for a new student, laid out day by day. Every one teaches all {skillCount} SAT
        skills, mixes in review days, and schedules {testCount} of College Board&apos;s free official practice tests.
      </p>
      <p className={`mt-3 ${BODY}`}>Pick the date you&apos;re testing, or a length if you haven&apos;t chosen a date yet.</p>

      <section className="mt-10 scroll-mt-24" aria-labelledby="by-date">
        <h2 id="by-date" className={H2}>
          Pick your test date
        </h2>
        {dates.length === 0 ? (
          <p className={`mt-3 ${BODY}`}>
            No upcoming test dates are listed right now. See the{" "}
            <Link href="/sat-test-dates" className="font-semibold text-[#26427e] underline underline-offset-4">
              SAT test dates
            </Link>{" "}
            page for more.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2.5">
            {dates.map((d) =>
              d.plan ? (
                <li key={d.slug}>
                  <Link href={`/sat-study-plan/${d.slug}`} className={CARD}>
                    <span className="min-w-0">
                      <span className="block text-[17px] font-semibold leading-snug text-[#26427e]">{longDate(d.date)}</span>
                      <span className="block text-[14px] text-stone-600">
                        {formatDay(d.date, { weekday: "long" })} · {weeksAndDays(d.daysAway)} away
                      </span>
                    </span>
                    <span aria-hidden className="flex-none text-[#26427e]">
                      →
                    </span>
                  </Link>
                </li>
              ) : (
                <li key={d.slug} className="flex flex-col gap-1 rounded-xl border border-dashed border-[#c9d6ee] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="min-w-0">
                    <span className="block text-[17px] font-semibold leading-snug text-ink">{longDate(d.date)}</span>
                    <span className="block text-[14px] text-stone-600">
                      {d.daysAway <= 0
                        ? "That's today. Good luck!"
                        : `${weeksAndDays(d.daysAway)} away. Oakmont sizes a plan to it when you start.`}
                    </span>
                  </span>
                  {d.daysAway > 0 && (
                    <Link href="/start" className="inline-flex min-h-[44px] flex-none items-center text-[16px] font-semibold text-[#26427e] underline underline-offset-4">
                      Start now
                    </Link>
                  )}
                </li>
              )
            )}
          </ul>
        )}
      </section>

      <section className="mt-10 scroll-mt-24" aria-labelledby="by-length">
        <h2 id="by-length" className={H2}>
          Or pick a length
        </h2>
        <ul className="mt-4 flex flex-col gap-2.5">
          {lengths.map(({ spec, plan }) => (
            <li key={spec.slug}>
              <Link href={`/sat-study-plan/${spec.slug}`} className={CARD}>
                <span className="min-w-0">
                  <span className="block text-[17px] font-semibold leading-snug text-[#26427e]">{spec.months}-month plan</span>
                  <span className="block text-[14px] text-stone-600">
                    {count(plan.stats.weeks, "week")} · {lessonsPerWeekText(plan.stats)} lessons a week
                  </span>
                </span>
                <span aria-hidden className="flex-none text-[#26427e]">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <StartFree
        text={`Answer 5 quick questions and get a plan sized to your own test date. ${TRIAL_DAYS} days free, no card needed.`}
      />

      <nav aria-label="More" className="mt-2 flex flex-col gap-1 border-t border-[#c9d6ee] pt-5 sm:flex-row sm:flex-wrap sm:gap-x-6">
        <Link href="/sat-test-dates" className="inline-flex min-h-[44px] items-center text-[16px] font-semibold text-[#26427e] underline-offset-4 hover:underline">
          SAT test dates
        </Link>
        <Link href="/sat" className="inline-flex min-h-[44px] items-center text-[16px] font-semibold text-[#26427e] underline-offset-4 hover:underline">
          All {skillCount} SAT skills
        </Link>
      </nav>
    </SeoShell>
  );
}
