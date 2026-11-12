import { prisma } from "./prisma";
import { liveStreak } from "./gamification";

export async function getUserStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      daysStudied: true,
      streakFreezes: true,
      streakRepairTo: true,
      streakRepairDay: true,
      createdAt: true,
      baselineScore: true,
      goalScore: true,
      targetTestDate: true,
      lastActiveDate: true,
      welcomeSeenAt: true,
      firstName: true,
      onboardingChecklistDismissedAt: true,
      parentOptOutAt: true,
      lastLoginAt: true,
      previousLoginAt: true,
      petBornAt: true,
      equippedCostume: true,
      stripeCustomerId: true,
      subscriptionStatus: true,
      currentPeriodEnd: true,
      accessExpiresAt: true,
      passRetakeClaimedAt: true,
      firstSkillId: true,
      trialEndsAt: true,
      timeZone: true,
    },
  });
  return (
    user ?? {
      currentStreak: 0,
      longestStreak: 0,
      daysStudied: 0,
      streakFreezes: 1,
      streakRepairTo: null,
      streakRepairDay: null,
      createdAt: new Date(),
      baselineScore: null,
      goalScore: null,
      targetTestDate: null,
      lastActiveDate: null,
      welcomeSeenAt: null,
      firstName: null,
      onboardingChecklistDismissedAt: null,
      parentOptOutAt: null,
      lastLoginAt: null,
      previousLoginAt: null,
      petBornAt: new Date(),
      equippedCostume: null,
      stripeCustomerId: null,
      subscriptionStatus: null,
      currentPeriodEnd: null,
      accessExpiresAt: null,
      passRetakeClaimedAt: null,
      firstSkillId: null,
      trialEndsAt: null,
      timeZone: null,
    }
  );
}

/**
 * The part of the stats row AppShell reads: the streak for the header and
 * the access fields behind the free-trial bar. AppShell is a client
 * component, so whatever a page hands it is serialised into the HTML --
 * pages pass this instead of the whole row (Stripe customer id and all).
 * The streak is the live one: a chain that has already lapsed shows as
 * nothing rather than as the last number stored.
 */
export function shellStats(stats: Awaited<ReturnType<typeof getUserStats>>) {
  return {
    currentStreak: liveStreak(stats.currentStreak, stats.lastActiveDate, new Date(), stats.timeZone, stats.streakFreezes),
    subscriptionStatus: stats.subscriptionStatus,
    accessExpiresAt: stats.accessExpiresAt,
    trialEndsAt: stats.trialEndsAt,
    // So the shell can tell when the browser's zone differs and report it.
    timeZone: stats.timeZone,
  };
}
