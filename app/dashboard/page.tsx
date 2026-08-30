import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getUserStats } from "@/lib/user";
import { computePacing, courseLengthDaysForUser, daysUntilTest } from "@/lib/pacing";
import { computePetState, PET_NAME } from "@/lib/pet";
import { computeDomainMastery, completedDomainCount, type ProgressMap } from "@/lib/mastery";
import { isCostumeUnlocked, bestUnlockedCostume } from "@/lib/costumes";
import { getTodayPlanItem } from "@/lib/studyPlan";
import { CURRICULUM, ALL_SUBSKILLS, ALL_DOMAINS, buildStudyPlan, getSubskill } from "@/data/curriculum";
import { AppShell } from "@/components/AppShell";
import { PetCard } from "@/components/PetCard";
import { WelcomeBackModal } from "@/components/WelcomeBackModal";
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
  if (!stats.welcomeSeenAt) redirect("/welcome");

  const progress: ProgressMap = {};
  for (const row of rows) {
    progress[row.subskillId] = { bestScore: row.bestScore, total: row.total };
  }
  const createdAt = stats.createdAt ?? new Date();
  const courseLengthDays = courseLengthDaysForUser(createdAt, stats.targetTestDate ?? null);
  // Enough whole weeks to reach the exact day count -- the final week is
  // truncated at render/lookup time (see getTodayPlanItem) so the plan
  // never schedules anything past the real target date.
  const studyPlan = buildStudyPlan(Math.ceil(courseLengthDays / 7));
  // Pace against the plan's actual scope (the subskills it schedules
  // week-by-week), not the full subskill bank, so the numbers line up with
  // what /plan shows.
  const planSubskillIds = new Set(studyPlan.flatMap((w) => w.subskillIds));
  const completedInPlan = Object.keys(progress).filter((id) => planSubskillIds.has(id)).length;
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

  const subskillsByDomain: Record<string, string[]> = {};
  for (const s of ALL_SUBSKILLS) (subskillsByDomain[s.domain] ??= []).push(s.id);
  const domainMastery = computeDomainMastery(
    ALL_DOMAINS,
    subskillsByDomain,
    progress,
    (latestTest?.domainScores as Record<string, number> | null) ?? null
  );
  const sectionsCompleted = completedDomainCount(domainMastery);
  const costume =
    stats.equippedCostume && isCostumeUnlocked(stats.equippedCostume, sectionsCompleted)
      ? stats.equippedCostume
      : bestUnlockedCostume(sectionsCompleted).id;

  const petState = computePetState(stats.lastActiveDate ?? null, stats.petDiedAt ?? null, stats.petBornAt);

  let quizzesLastSession = 0;
  let masteredLastSession = 0;
  if (stats.previousLoginAt && stats.lastLoginAt) {
    const from = stats.previousLoginAt.getTime();
    const to = stats.lastLoginAt.getTime();
    for (const row of rows) {
      const t = row.lastAttempt.getTime();
      if (t >= from && t < to) {
        quizzesLastSession++;
        if (row.bestScore === row.total) masteredLastSession++;
      }
    }
  }
  const showWelcomeBack =
    !!stats.previousLoginAt &&
    !!stats.lastLoginAt &&
    stats.lastLoginAt.getTime() - stats.previousLoginAt.getTime() > WELCOME_BACK_GAP_MS;

  return (
    <AppShell email={user.email} stats={stats}>
      {showWelcomeBack && stats.previousLoginAt && stats.lastLoginAt && (
        <WelcomeBackModal
          sessionKey={stats.lastLoginAt.toISOString()}
          previousLoginAt={stats.previousLoginAt.toISOString()}
          quizzesLastSession={quizzesLastSession}
          masteredLastSession={masteredLastSession}
          currentStreak={stats.currentStreak}
        />
      )}
      <PetCard petName={PET_NAME} state={petState} costume={costume} />
      <DashboardClient
        curriculum={CURRICULUM}
        progress={progress}
        totalSubskills={ALL_SUBSKILLS.length}
        stats={stats}
        pacing={pacing}
        domainMastery={domainMastery}
        today={today}
        daysUntilTest={daysUntilTest(stats.targetTestDate ?? null)}
        thisWeek={{ done: weekDone, total: weekTotal }}
      />
    </AppShell>
  );
}
