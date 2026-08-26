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
    }
  );
}
