-- Onboarding / login-summary tracking
ALTER TABLE "User" ADD COLUMN "welcomeSeenAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "lastLoginAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "previousLoginAt" TIMESTAMP(3);

-- Backfill existing users as already onboarded, so only genuinely new
-- signups get routed to the welcome page.
UPDATE "User" SET "welcomeSeenAt" = "createdAt" WHERE "welcomeSeenAt" IS NULL;

-- Study-streak pet
ALTER TABLE "User" ADD COLUMN "petDiedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "petBornAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN "petWarningEmailSentAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "petDeathEmailSentAt" TIMESTAMP(3);
