import { ALL_DOMAINS, ALL_SUBSKILLS, buildStudyPlan, getSubskill } from "@/data/curriculum";
import { computeDomainMastery, orderSubskillsByWeakness } from "@/lib/mastery";
import { courseLengthDaysForUser } from "@/lib/pacing";
import { leadWith } from "@/lib/planOrder";
import { progressMapFromRows } from "@/lib/progressState";
import { getTodayPlanItem } from "@/lib/studyPlan";
import { utcDayDiff } from "@/lib/dateOnly";

// What a student's plan says to do today, worked out the same way the
// dashboard does (their own plan order, weakest areas first), for places
// that only need the answer: the daily emails.

export interface TodayPlan {
  kind: "lesson" | "review" | "test" | "rest" | "done";
  // A short title: the skill's name, "Mixed review", "Practice test 3".
  title: string;
  // Where "start" should go.
  href: string;
  // For a lesson day: one of the skill's own tips, to put in the email.
  tip: string | null;
}

type ProgressRows = Parameters<typeof progressMapFromRows>[0];

const SUBSKILLS_BY_DOMAIN: Record<string, string[]> = {};
for (const s of ALL_SUBSKILLS) (SUBSKILLS_BY_DOMAIN[s.domain] ??= []).push(s.id);

export function todayPlanFor(
  student: { createdAt: Date; targetTestDate: Date | null; firstSkillId: string | null },
  progressRows: ProgressRows,
  latestDomainScores: Record<string, number> | null,
  now: Date = new Date(),
): TodayPlan {
  const progress = progressMapFromRows(progressRows, now);
  const mastery = computeDomainMastery(ALL_DOMAINS, SUBSKILLS_BY_DOMAIN, progress, latestDomainScores);
  const order = leadWith(orderSubskillsByWeakness(ALL_SUBSKILLS, mastery), student.firstSkillId);
  const days = courseLengthDaysForUser(student.createdAt, student.targetTestDate);
  const plan = buildStudyPlan(Math.ceil(days / 7), order);
  const item = getTodayPlanItem(plan, student.createdAt, now, days);
  if (!item) return { kind: "done", title: "Mixed review", href: "/dashboard", tip: null };
  const { day } = item;
  if (day.type === "lesson" && day.subskillIds.length) {
    const skills = day.subskillIds.map((id) => getSubskill(id)).filter((s): s is NonNullable<typeof s> => !!s);
    const first = skills[0];
    // A different tip each day, from the skill's own list.
    const tips = first?.tipsAndTricks ?? [];
    const tip = tips.length ? tips[Math.abs(utcDayDiff(student.createdAt, now)) % tips.length] : null;
    return {
      kind: "lesson",
      title: skills.length > 1 ? `${first.name} and ${skills.length - 1} more` : first?.name ?? "Today's lesson",
      href: `/subskill/${day.subskillIds[0]}`,
      tip,
    };
  }
  if (day.type === "test") return { kind: "test", title: `Practice test${day.testNumber ? ` ${day.testNumber}` : ""}`, href: "/dashboard", tip: null };
  if (day.type === "review") return { kind: "review", title: "Mixed review", href: "/dashboard", tip: null };
  return { kind: "rest", title: "A rest day", href: "/dashboard", tip: null };
}
