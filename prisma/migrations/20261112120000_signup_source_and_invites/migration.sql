-- AlterTable
ALTER TABLE "User" ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referralMonthsEarned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referralRewardedAt" TIMESTAMP(3),
ADD COLUMN     "referredById" TEXT,
ADD COLUMN     "signupCampaign" TEXT,
ADD COLUMN     "signupLanding" TEXT,
ADD COLUMN     "signupMedium" TEXT,
ADD COLUMN     "signupReferrer" TEXT,
ADD COLUMN     "signupSource" TEXT;

-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "signupCampaign" TEXT,
ADD COLUMN     "signupLanding" TEXT,
ADD COLUMN     "signupMedium" TEXT,
ADD COLUMN     "signupReferrer" TEXT,
ADD COLUMN     "signupSource" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- CreateIndex
CREATE INDEX "User_referredById_idx" ON "User"("referredById");

