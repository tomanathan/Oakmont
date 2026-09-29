-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activitiesToday" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "daysStudied" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "streakFreezes" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "streakRepairDay" TIMESTAMP(3),
ADD COLUMN     "streakRepairTo" INTEGER;

-- Existing accounts: days studied so far, from the days they answered
-- questions, and never less than their longest streak (lessons also counted
-- toward that, and a streak of N means at least N days of study).
UPDATE "User" u
SET "daysStudied" = GREATEST(
  u."longestStreak",
  COALESCE((SELECT COUNT(DISTINCT DATE(a."createdAt")) FROM "ItemAttempt" a WHERE a."userId" = u."id"), 0)
);
