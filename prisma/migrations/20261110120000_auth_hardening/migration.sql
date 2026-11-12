-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "sessionsValidAfter" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "sessionsValidAfter" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "StripeGrant" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeGrant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RateLimit_windowStart_idx" ON "RateLimit"("windowStart");

-- CreateIndex
CREATE INDEX "ParentLink_studentId_idx" ON "ParentLink"("studentId");

-- CreateIndex
CREATE INDEX "ItemAttempt_userId_subskillId_idx" ON "ItemAttempt"("userId", "subskillId");


-- Addresses already proven: anyone who signs in with Google, and parents
-- whose account a student created and who then set their password through
-- the emailed link (the link clears the token; the first link row is made
-- in the same moment as the account).
UPDATE "User" SET "emailVerifiedAt" = CURRENT_TIMESTAMP WHERE "googleSub" IS NOT NULL;
UPDATE "Parent" p SET "emailVerifiedAt" = CURRENT_TIMESTAMP
WHERE p."googleSub" IS NOT NULL
   OR (
     p."passwordHash" IS NOT NULL
     AND p."setupToken" IS NULL
     AND p."setupEmailSentAt" IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM "ParentLink" l
       WHERE l."parentId" = p."id" AND l."createdAt" < p."createdAt" + interval '10 seconds'
     )
   );
