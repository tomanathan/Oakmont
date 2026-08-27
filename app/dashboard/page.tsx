import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getUserStats } from "@/lib/user";
import { computePacing, courseLengthDaysForUser } from "@/lib/pacing";
import { computePetState, PET_NAME } from "@/lib/pet";
import { CURRICULUM, ALL_SUBSKILLS, buildStudyPlan } from "@/data/curriculum";
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

  const [rows, stats] = await Promise.all([
    prisma.progress.findMany({ where: { userId: user.userId } }),
    getUserStats(user.userId),
  ]);
  if (!stats.welcomeSeenAt) redirect("/welcome");

  const progress: Record<string, { bestScore: number; total: number }> = {};
  for (const row of rows) {
    progress[row.subskillId] = { bestScore: row.bestScore, total: row.total };
  }
  const createdAt = stats.createdAt ?? new Date();
  const courseLengthDays = courseLengthDaysForUser(createdAt, stats.targetTestDate ?? null);
  const studyPlan = buildStudyPlan(Math.round(courseLengthDays / 7));
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
      <PetCard petName={PET_NAME} state={petState} />
      <DashboardClient
        curriculum={CURRICULUM}
        progress={progress}
        totalSubskills={ALL_SUBSKILLS.length}
        stats={stats}
        pacing={pacing}
      />
    </AppShell>
  );
}
