-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstPaidAt" TIMESTAMP(3),
ADD COLUMN     "firstSkillId" TEXT,
ADD COLUMN     "firstStudiedAt" TIMESTAMP(3),
ADD COLUMN     "starterResult" JSONB;


-- Existing accounts: their first day of study is their earliest answered question.
UPDATE "User" u
SET "firstStudiedAt" = (SELECT MIN(a."createdAt") FROM "ItemAttempt" a WHERE a."userId" = u."id")
WHERE u."firstStudiedAt" IS NULL;
