import { prisma } from "./prisma";

export async function getUserStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      createdAt: true,
      baselineScore: true,
      goalScore: true,
      targetTestDate: true,
      lastActiveDate: true,
      welcomeSeenAt: true,
      firstName: true,
      onboardingChecklistDismissedAt: true,
      lastLoginAt: true,
      previousLoginAt: true,
      petDiedAt: true,
      petBornAt: true,
      equippedCostume: true,
      stripeCustomerId: true,
      subscriptionStatus: true,
      currentPeriodEnd: true,
      accessExpiresAt: true,
    },
  });
  return (
    user ?? {
      currentStreak: 0,
      longestStreak: 0,
      createdAt: new Date(),
      baselineScore: null,
      goalScore: null,
      targetTestDate: null,
      lastActiveDate: null,
      welcomeSeenAt: null,
      firstName: null,
      onboardingChecklistDismissedAt: null,
      lastLoginAt: null,
      previousLoginAt: null,
      petDiedAt: null,
      petBornAt: new Date(),
      equippedCostume: null,
      stripeCustomerId: null,
      subscriptionStatus: null,
      currentPeriodEnd: null,
      accessExpiresAt: null,
    }
  );
}
