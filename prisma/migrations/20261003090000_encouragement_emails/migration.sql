-- AlterTable
ALTER TABLE "User" ADD COLUMN     "encourageEmails" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastMorningEmailAt" TIMESTAMP(3),
ADD COLUMN     "lastNudgeEmailAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "dailyEmails" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastMorningEmailAt" TIMESTAMP(3),
ADD COLUMN     "lastNudgeEmailAt" TIMESTAMP(3);

