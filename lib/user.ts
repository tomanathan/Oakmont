import { prisma } from "./prisma";

export async function getUserStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalXP: true, currentStreak: true, longestStreak: true, createdAt: true },
  });
  return user ?? { totalXP: 0, currentStreak: 0, longestStreak: 0, createdAt: new Date() };
}
