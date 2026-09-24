import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getUserStats } from "@/lib/user";
import { hasActiveAccess } from "@/lib/subscription";
import { computePacing, courseLengthDaysForUser, daysUntilTest } from "@/lib/pacing";
import { computePetState } from "@/lib/pet";
import { computeDomainMastery, completedDomainCount, orderSubskillsByWeakness } from "@/lib/mastery";
import { progressMapFromRows, isPassed } from "@/lib/progressState";
import { reviewCounts } from "@/lib/reviewSet";
import { companionSummary } from "@/lib/companionSummary";
import { getTodayPlanItem } from "@/lib/studyPlan";
import { CURRICULUM, ALL_SUBSKILLS, ALL_DOMAINS, buildStudyPlan, getSubskill } from "@/data/curriculum";
import { AppShell } from "@/components/AppShell";
import { WelcomeBackModal } from "@/components/WelcomeBackModal";
import { type ChecklistItem } from "@/components/GettingStarted";
import { DashboardClient } from "./DashboardClient";

// Only worth a "welcome back" recap if there was an actual gap since the
// last login -- logging in again a few minutes later (a dropped session,
// a refresh-triggered re-auth) isn't a new study session.
const WELCOME_BACK_GAP_MS = 2 * 60 * 60 * 1000;

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [rows, stats, latestTest] = await Promise.all([
    prisma.progress.findMany({ where: { userId: user.userId } }),
    getUserStats(user.userId),
    prisma.practiceTest.findFirst({ where: { userId: user.userId }, orderBy: { takenAt: "desc" } }),
  ]);
  // Onboarding comes before choosing a plan, so check it first.
  if (!stats.welcomeSeenAt) redirect("/welcome");
  if (!hasActiveAccess(stats.subscriptionStatus, stats.accessExpiresAt)) redirect("/subscribe");

  const progress = progressMapFromRows(rows);
  const createdAt = stats.createdAt ?? new Date();
  const courseLengthDays = courseLengthDaysForUser(createdAt, stats.targetTestDate ?? null);

  // Computed here, before the plan is built, so the plan itself can be
  // ordered by it (see orderSubskillsByWeakness below) -- the same
  // domainMastery this page already needed anyway for DashboardClient's
  // own subject toggle and star ratings further down, just moved earlier.
  const subskillsByDomain: Record<string, string[]> = {};
  for (const s of ALL_SUBSKILLS) (subskillsByDomain[s.domain] ??= []).push(s.id);
  const domainMastery = computeDomainMastery(
    ALL_DOMAINS,
    subskillsByDomain,
    progress,
    (latestTest?.domainScores as Record<string, number> | null) ?? null
  );
  // Weakest domains first, so the plan spends more of a student's
  // remaining time on what practice tests and quizzes actually show
  // they're worst at -- see lib/mastery.ts's own doc for why this is a
  // stable reorder (a brand-new student with no data gets the original
  // order back unchanged) rather than a different subskill set.
  const weaknessOrderedIds = orderSubskillsByWeakness(ALL_SUBSKILLS, domainMastery);

  // Enough whole weeks to reach the exact day count -- the final week is
  // truncated at render/lookup time (see getTodayPlanItem) so the plan
  // never schedules anything past the real target date.
  const studyPlan = buildStudyPlan(Math.ceil(courseLengthDays / 7), weaknessOrderedIds);
  // Pace against the plan's actual scope (the subskills it schedules
  // week-by-week), not the full subskill bank, so the numbers line up with
  // what /plan shows. Counts PASSED subskills (a perfect quiz), not merely
  // attempted ones -- the plan's pace is about working through new
  // material; mastering it is mixed review's job, on its own schedule.
  const planSubskillIds = new Set(studyPlan.flatMap((w) => w.subskillIds));
  const completedInPlan = Object.entries(progress).filter(([id, p]) => planSubskillIds.has(id) && isPassed(p)).length;
  const pacing = computePacing(
    createdAt,
    new Date(),
    planSubskillIds.size,
    completedInPlan,
    courseLengthDays
  );

  const todayItem = getTodayPlanItem(studyPlan, createdAt, new Date(), courseLengthDays);
  const nameSubskill = (id: string) => {
    const s = getSubskill(id);
    return { id, name: s?.name ?? id, section: s?.section ?? "", domain: s?.domain ?? "" };
  };
  const today = todayItem
    ? {
        week: todayItem.week,
        dayName: todayItem.day.dayName,
        type: todayItem.day.type,
        testNumber: todayItem.day.testNumber,
        subskills: todayItem.day.subskillIds.map(nameSubskill),
      }
    : null;

  // This week's slice of the plan, for the dashboard's own "this week"
  // progress cut (see PlanClient for the plan page's overall-progress bar,
  // which now lives there instead of duplicating it here).
  const thisWeek = todayItem ? studyPlan.find((w) => w.week === todayItem.week) : null;
  const weekDone = thisWeek ? thisWeek.subskillIds.filter((id) => progress[id]).length : 0;
  const weekTotal = thisWeek ? thisWeek.subskillIds.length : 0;

  let quizzesLastSession = 0;
  let masteredLastSession = 0;
  if (stats.previousLoginAt && stats.lastLoginAt) {
    const from = stats.previousLoginAt.getTime();
    const to = stats.lastLoginAt.getTime();
    for (const row of rows) {
      const t = row.lastAttempt.getTime();
      if (t >= from && t < to) quizzesLastSession++;
      // Mastery now lands in mixed review, which doesn't touch lastAttempt.
      const m = row.masteredAt?.getTime();
      if (m !== undefined && m >= from && m < to) masteredLastSession++;
    }
  }
  const showWelcomeBack =
    !!stats.previousLoginAt &&
    !!stats.lastLoginAt &&
    stats.lastLoginAt.getTime() - stats.previousLoginAt.getTime() > WELCOME_BACK_GAP_MS;

  // Coming back after a gap is exactly when the pet is most likely to be
  // hungry, critical, or already gone -- so the welcome-back modal is
  // where that lands hardest. Same computation the settings card and the
  // header pill use.
  const petState = computePetState(stats.lastActiveDate ?? null, stats.petDiedAt ?? null, stats.petBornAt);

  // Getting-started checklist: each item checked off by real activity.
  let checklist: ChecklistItem[] | null = null;
  if (!stats.onboardingChecklistDismissedAt) {
    const [lessonViews, reviewAttempts, parentLinks] = await Promise.all([
      prisma.lessonView.count({ where: { userId: user.userId } }),
      prisma.itemAttempt.count({ where: { userId: user.userId, source: "review" } }),
      prisma.parentLink.findMany({ where: { studentId: user.userId }, select: { parent: { select: { email: true, passwordHash: true } } } }),
    ]);
    const firstId = todayItem?.day.subskillIds[0] ?? weaknessOrderedIds[0];
    checklist = [
      {
        id: "goals",
        title: "Set your test date and goal",
        body: "Your plan resizes to fit the time you have.",
        href: "/welcome?step=date",
        done: !!stats.targetTestDate && stats.goalScore !== null,
      },
      {
        id: "lesson",
        title: "Read your first lesson",
        body: "Short, with worked examples and the traps to avoid.",
        href: `/subskill/${firstId}`,
        done: lessonViews > 0,
      },
      {
        id: "quiz",
        title: "Pass your first quiz",
        body: "Get every question right to pass a skill.",
        href: `/subskill/${firstId}`,
        done: Object.values(progress).some((p) => isPassed(p)),
      },
      {
        id: "review",
        title: "Try a mixed review",
        body: "Passed skills come back mixed together. Right again means mastered.",
        href: "/review",
        done: reviewAttempts > 0,
      },
      {
        id: "test",
        title: "Log a practice test",
        body: "Take one in Bluebook, then enter your scores. Your plan adapts.",
        href: "/plan#practice-tests",
        done: !!latestTest,
      },
      {
          id: "parent",
          title: parentLinks.length ? "Get your parent set up" : "Add a parent",
          body: parentLinks.length
            ? `Waiting for ${parentLinks[0].parent.email} to set a password. You can resend it in Settings.`
            : "They get their own dashboard of your progress and a Sunday email.",
          href: parentLinks.length ? "/settings#parents" : "/welcome?step=parent",
          done: parentLinks.some((l) => !!l.parent.passwordHash),
        },
    ];
  }

  return (
    <AppShell email={user.email} stats={stats} wide>
      {showWelcomeBack && stats.previousLoginAt && stats.lastLoginAt && (
        <WelcomeBackModal
          sessionKey={stats.lastLoginAt.toISOString()}
          previousLoginAt={stats.previousLoginAt.toISOString()}
          quizzesLastSession={quizzesLastSession}
          masteredLastSession={masteredLastSession}
          currentStreak={stats.currentStreak}
          petStage={petState.stage}
          petMessage={petState.message}
        />
      )}
      <DashboardClient
        firstName={stats.firstName ?? null}
        checklist={checklist}
        curriculum={CURRICULUM}
        progress={progress}
        pacing={pacing}
        domainMastery={domainMastery}
        today={today}
        daysUntilTest={daysUntilTest(stats.targetTestDate ?? null)}
        thisWeek={{ done: weekDone, total: weekTotal }}
        planOrder={weaknessOrderedIds}
        review={reviewCounts(progress)}
        companion={companionSummary({
          lastActiveDate: stats.lastActiveDate ?? null,
          petDiedAt: stats.petDiedAt ?? null,
          petBornAt: stats.petBornAt,
          currentStreak: stats.currentStreak,
          longestStreak: stats.longestStreak,
          equippedCostume: stats.equippedCostume ?? null,
          domainsCompleted: completedDomainCount(domainMastery),
        })}
      />
    </AppShell>
  );
}
