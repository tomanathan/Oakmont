import { ALL_DOMAINS, ALL_SUBSKILLS, NUM_FULL_LENGTH_TESTS, buildStudyPlan, getSubskill } from "@/data/curriculum";
import { buildDayPlan, type DayType } from "@/lib/studyPlan";
import { DEFAULT_COURSE_LENGTH_DAYS, courseLengthDaysForUser } from "@/lib/pacing";
import { computeDomainMastery, orderSubskillsByWeakness } from "@/lib/mastery";
import { SAT_DATES, upcomingSatDates } from "@/lib/satDates";
import { addUTCDays, localDay, parseDateOnly, utcDayDiff } from "@/lib/dateOnly";
import { slugForSubskill } from "@/lib/skillSlugs";

// The public study-plan pages (app/sat-study-plan, app/sat-test-dates): the
// plan a brand-new student gets for a given length or test date, built by
// the same functions the signed-in plan page uses (app/plan/page.tsx) and
// shaped for display. Server only: it pulls in the whole curriculum, so no
// client component may import it.

// "Today" for pages that have no student: the calendar day on the US East
// Coast, where most test takers are.
export const PUBLIC_TIME_ZONE = "America/New_York";

// The shortest plan these pages show. The planner packs 8 practice tests
// into the plan's weeks, so anything under 8 weeks puts two tests on back
// to back days (scheduleProblems below). The brief asked for 6 weeks; 6 and
// 7 both fail that check, so 8 is the floor until the planner handles
// short plans better.
export const MIN_PUBLIC_PLAN_WEEKS = 8;
export const MIN_PUBLIC_PLAN_DAYS = MIN_PUBLIC_PLAN_WEEKS * 7;

export interface LengthPlanSpec {
  kind: "length";
  slug: string;
  months: number;
  days: number;
}

export interface DatePlanSpec {
  kind: "date";
  slug: string;
  date: string; // yyyy-mm-dd, as in SAT_DATES
}

export type PlanSpec = LengthPlanSpec | DatePlanSpec;

// Whole weeks, so every week of an undated plan is a full 7 days. Six
// months is the planner's own default length.
export const LENGTH_PLANS: LengthPlanSpec[] = [
  { kind: "length", slug: "2-month", months: 2, days: 8 * 7 },
  { kind: "length", slug: "3-month", months: 3, days: 12 * 7 },
  { kind: "length", slug: "4-month", months: 4, days: 16 * 7 },
  { kind: "length", slug: "6-month", months: 6, days: DEFAULT_COURSE_LENGTH_DAYS },
];

/** Formats a calendar day (UTC midnight on the dateOnly grid) in US English, whatever the server's locale. */
export function formatDay(d: Date | string, opts: Intl.DateTimeFormatOptions): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-US", { ...opts, timeZone: "UTC" }).format(date);
}

/** "march-2027" for 2027-03-06. */
export function slugForSatDate(date: string): string {
  return `${formatDay(date, { month: "long" }).toLowerCase()}-${date.slice(0, 4)}`;
}

export const DATE_PLANS: DatePlanSpec[] = SAT_DATES.map((d) => ({ kind: "date", slug: slugForSatDate(d.date), date: d.date }));

// Two test dates in one month would share an address and one plan would be
// unreachable; fail the build instead.
{
  const seen = new Set<string>(LENGTH_PLANS.map((p) => p.slug));
  for (const p of DATE_PLANS) {
    if (seen.has(p.slug)) throw new Error(`Duplicate study plan slug "${p.slug}"`);
    seen.add(p.slug);
  }
}

export function allPlanSlugs(): string[] {
  return [...LENGTH_PLANS, ...DATE_PLANS].map((p) => p.slug);
}

export function planSpecForSlug(slug: string): PlanSpec | undefined {
  return LENGTH_PLANS.find((p) => p.slug === slug) ?? DATE_PLANS.find((p) => p.slug === slug);
}

/** Today's calendar day in PUBLIC_TIME_ZONE, as UTC midnight. */
export function publicToday(now: Date = new Date()): Date {
  return localDay(now, PUBLIC_TIME_ZONE);
}

/** Whole days from today (Eastern) to a yyyy-mm-dd date; negative once it has passed. */
export function daysFromToday(date: string, now: Date = new Date()): number {
  return utcDayDiff(publicToday(now), `${date}T00:00:00Z`);
}

export interface PublicSkill {
  id: string;
  name: string;
  section: string;
  slug: string;
}

export interface PublicPlanDay {
  day: number; // 1-7 within its week
  date: string | null; // yyyy-mm-dd for a date plan, null for a length plan
  type: DayType;
  skills: PublicSkill[];
  testNumber?: number;
  weekly?: boolean;
}

export interface PublicPlanWeek {
  week: number;
  start: string | null;
  end: string | null;
  days: PublicPlanDay[];
  lessons: number;
  reviews: number;
  rests: number;
  testNumbers: number[];
}

export interface PlanStats {
  weeks: number;
  days: number;
  lessons: number; // skills taught, one lesson each
  lessonDays: number;
  reviewDays: number; // weekly reviews included
  weeklyReviews: number;
  tests: number;
  restDays: number;
  busiestDay: number; // most lessons on one day
  lessonsPerWeek: { min: number; max: number }; // over the weeks that teach something
}

export interface PublicPlan {
  spec: PlanSpec;
  totalDays: number;
  start: string | null; // the plan's first day (today) for a date plan
  testDate: string | null;
  weeks: PublicPlanWeek[];
  stats: PlanStats;
  skillCount: number; // every skill on the test, for "covers all N"
  testCount: number; // practice tests the planner schedules
}

/**
 * The order a brand-new student's plan uses: no quiz or practice-test
 * results yet, so the weakness ordering leaves every domain at its neutral
 * score. The same call /start makes (app/start/page.tsx).
 */
function newStudentOrder(): string[] {
  const byDomain: Record<string, string[]> = {};
  for (const s of ALL_SUBSKILLS) (byDomain[s.domain] ??= []).push(s.id);
  return orderSubskillsByWeakness(ALL_SUBSKILLS, computeDomainMastery(ALL_DOMAINS, byDomain, {}, null));
}

function publicSkill(id: string): PublicSkill {
  const s = getSubskill(id);
  return { id, name: s?.name ?? id, section: s?.section ?? "", slug: slugForSubskill(id) ?? "" };
}

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Builds the plan for a length or a test date exactly as app/plan/page.tsx
 * does for a student who signs up `now` (in PUBLIC_TIME_ZONE): the same
 * length, week count, skill order and day-by-day breakdown, with the last
 * week cut short so a date plan ends the day before the test. Returns null
 * for a date that is today or has passed. Does not check that the plan is
 * fit to show; see showablePlan.
 */
export function buildPublicPlan(spec: PlanSpec, now: Date = new Date()): PublicPlan | null {
  let totalDays: number;
  let start: Date | null = null;
  let testDate: Date | null = null;
  if (spec.kind === "length") {
    totalDays = spec.days;
  } else {
    testDate = parseDateOnly(spec.date);
    if (!testDate) return null;
    start = publicToday(now);
    if (utcDayDiff(start, testDate) <= 0) return null;
    totalDays = courseLengthDaysForUser(now, testDate, PUBLIC_TIME_ZONE);
  }

  const totalWeeks = Math.ceil(totalDays / 7);
  const studyPlan = buildStudyPlan(totalWeeks, newStudentOrder());

  const prior: string[] = [];
  const weeks: PublicPlanWeek[] = studyPlan.map((w, i) => {
    const isLastWeek = i === studyPlan.length - 1;
    const dayCount = isLastWeek ? totalDays - i * 7 : 7;
    const weekStart = start ? addUTCDays(start, i * 7) : null;
    const days: PublicPlanDay[] = buildDayPlan(w, prior, dayCount).map((d) => ({
      day: d.day,
      date: weekStart ? isoDay(addUTCDays(weekStart, d.day - 1)) : null,
      type: d.type,
      skills: d.subskillIds.map(publicSkill),
      ...(d.testNumber !== undefined ? { testNumber: d.testNumber } : {}),
      ...(d.weekly ? { weekly: true } : {}),
    }));
    prior.push(...w.subskillIds);
    return {
      week: w.week,
      start: weekStart ? isoDay(weekStart) : null,
      end: weekStart ? isoDay(addUTCDays(weekStart, days.length - 1)) : null,
      days,
      lessons: days.reduce((n, d) => n + (d.type === "lesson" ? d.skills.length : 0), 0),
      reviews: days.filter((d) => d.type === "review").length,
      rests: days.filter((d) => d.type === "rest").length,
      testNumbers: days.filter((d) => d.type === "test").map((d) => d.testNumber!),
    };
  });

  const allDays = weeks.flatMap((w) => w.days);
  const teaching = weeks.map((w) => w.lessons).filter((n) => n > 0);
  const stats: PlanStats = {
    weeks: weeks.length,
    days: allDays.length,
    lessons: weeks.reduce((n, w) => n + w.lessons, 0),
    lessonDays: allDays.filter((d) => d.type === "lesson").length,
    reviewDays: allDays.filter((d) => d.type === "review").length,
    weeklyReviews: allDays.filter((d) => d.weekly).length,
    tests: allDays.filter((d) => d.type === "test").length,
    restDays: allDays.filter((d) => d.type === "rest").length,
    busiestDay: Math.max(0, ...allDays.map((d) => (d.type === "lesson" ? d.skills.length : 0))),
    lessonsPerWeek: { min: Math.min(...teaching), max: Math.max(...teaching) },
  };

  return {
    spec,
    totalDays,
    start: start ? isoDay(start) : null,
    testDate: testDate ? isoDay(testDate) : null,
    weeks,
    stats,
    skillCount: ALL_SUBSKILLS.length,
    testCount: NUM_FULL_LENGTH_TESTS,
  };
}

/**
 * What would make a plan wrong to publish, or [] if nothing does: shorter
 * than the minimum, a skill missing or taught twice, more than 2 lessons on
 * one day, a practice test missing, or two practice tests on back to back
 * days (which happens on short plans, and on some plans of 8-12 weeks
 * whose last week is a single day).
 */
export function scheduleProblems(plan: PublicPlan): string[] {
  const problems: string[] = [];
  if (plan.totalDays < MIN_PUBLIC_PLAN_DAYS) problems.push(`shorter than ${MIN_PUBLIC_PLAN_WEEKS} weeks`);

  const taught = plan.weeks.flatMap((w) => w.days.flatMap((d) => (d.type === "lesson" ? d.skills.map((s) => s.id) : [])));
  const once = new Set(taught);
  if (taught.length !== once.size) problems.push("a skill is taught twice");
  if (ALL_SUBSKILLS.some((s) => !once.has(s.id)) || once.size !== ALL_SUBSKILLS.length) problems.push("not every skill is taught");
  if (plan.weeks.some((w) => w.days.some((d) => d.skills.some((s) => !s.slug)))) problems.push("a skill has no public page");

  if (plan.stats.busiestDay > 2) problems.push(`${plan.stats.busiestDay} lessons on one day`);

  const testDays: number[] = [];
  plan.weeks.forEach((w, wi) => w.days.forEach((d) => d.type === "test" && testDays.push(wi * 7 + d.day)));
  if (testDays.length !== plan.testCount) problems.push(`${testDays.length} of ${plan.testCount} practice tests scheduled`);
  if (testDays.some((d, i) => i > 0 && d - testDays[i - 1] <= 1)) problems.push("practice tests on back to back days");

  return problems;
}

/** The plan for `spec` if it is fit to publish today, else null (the page redirects to the hub). */
export function showablePlan(spec: PlanSpec, now: Date = new Date()): PublicPlan | null {
  const plan = buildPublicPlan(spec, now);
  return plan && scheduleProblems(plan).length === 0 ? plan : null;
}

/** Slugs of every plan page that shows a plan today (the others redirect to the hub). */
export function shownPlanSlugs(now: Date = new Date()): string[] {
  return [...LENGTH_PLANS, ...DATE_PLANS].filter((spec) => showablePlan(spec, now)).map((spec) => spec.slug);
}

export interface UpcomingDate {
  date: string;
  slug: string;
  daysAway: number;
  plan: PublicPlan | null; // null when no plan can be shown for it today
}

/** Every SAT date from today (Eastern) on, with its plan when one can be shown. */
export function upcomingDatePlans(now: Date = new Date()): UpcomingDate[] {
  return upcomingSatDates(publicToday(now)).map((d) => {
    const spec = DATE_PLANS.find((p) => p.date === d.date)!;
    return { date: d.date, slug: spec.slug, daysAway: daysFromToday(d.date, now), plan: showablePlan(spec, now) };
  });
}

/** "2 lessons", "1 rest day": a count and its noun, singular or plural. */
export function count(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** "16 weeks", or "16 weeks and 2 days". */
export function weeksAndDays(days: number): string {
  const w = Math.floor(days / 7);
  const r = days % 7;
  if (w === 0) return count(r, "day");
  return r === 0 ? count(w, "week") : `${count(w, "week")} and ${count(r, "day")}`;
}

/** "4 to 5" or "2", for lessons a week. */
export function lessonsPerWeekText(stats: PlanStats): string {
  const { min, max } = stats.lessonsPerWeek;
  return min === max ? `${min}` : `${min} to ${max}`;
}

export const longDate = (d: string) => formatDay(d, { month: "long", day: "numeric", year: "numeric" });

/** The plan's name and the page's h1. */
export function planName(spec: PlanSpec): string {
  return spec.kind === "length" ? `${spec.months}-Month SAT Study Plan` : `SAT Study Plan for the ${longDate(spec.date)} SAT`;
}

export function planSeoTitle(spec: PlanSpec): string {
  return spec.kind === "length"
    ? `${spec.months}-Month SAT Study Plan, Week by Week | Oakmont`
    : `${formatDay(spec.date, { month: "long", year: "numeric" })} SAT Study Plan, Week by Week | Oakmont`;
}

export function planSeoDescription(plan: PublicPlan): string {
  const s = plan.stats;
  if (plan.spec.kind === "length") {
    return `A free ${plan.spec.months}-month SAT study plan, day by day: all ${plan.skillCount} skills over ${s.weeks} weeks, with ${s.reviewDays} mixed review days and ${s.tests} official practice tests. Print it or start free.`;
  }
  const weeksAway = count(Math.floor(plan.totalDays / 7), "week");
  return `A free day-by-day study plan for the ${longDate(plan.spec.date)} SAT, ${weeksAway} away: all ${plan.skillCount} skills, mixed review and ${s.tests} official practice tests, starting today.`;
}
