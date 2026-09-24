-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "onboardingChecklistDismissedAt" TIMESTAMP(3),
ADD COLUMN     "parentInviteEmailCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "parentInviteEmailedAt" TIMESTAMP(3);

