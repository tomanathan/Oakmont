-- AlterTable
ALTER TABLE "User" ADD COLUMN     "trialEndsAt" TIMESTAMP(3),
ADD COLUMN     "trialReminderSentAt" TIMESTAMP(3);

-- Everyone who signed up but never started a subscription or bought a pass
-- (they met the old card-first paywall and stopped) gets the new no-card
-- free week, starting now.
UPDATE "User"
SET "trialEndsAt" = NOW() + INTERVAL '7 days'
WHERE "stripeSubscriptionId" IS NULL AND "accessExpiresAt" IS NULL;
