-- AlterTable
ALTER TABLE "Progress" ADD COLUMN     "masteredAt" TIMESTAMP(3),
ADD COLUMN     "passedAt" TIMESTAMP(3),
ADD COLUMN     "reviewDueAt" TIMESTAMP(3),
ADD COLUMN     "reviewInterval" INTEGER NOT NULL DEFAULT 21;

-- CreateTable
CREATE TABLE "ItemAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subskillId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "choice" INTEGER NOT NULL,
    "confidence" TEXT,
    "ms" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ItemAttempt_userId_createdAt_idx" ON "ItemAttempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ItemAttempt_userId_itemId_idx" ON "ItemAttempt"("userId", "itemId");

-- AddForeignKey
ALTER TABLE "ItemAttempt" ADD CONSTRAINT "ItemAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Backfill: every subskill already quizzed to a perfect score keeps its
-- mastery (earned under the old one-step rule), with its first refresher
-- due three weeks after that quiz -- so long-untouched ones come due now.
UPDATE "Progress"
SET "passedAt" = "lastAttempt",
    "masteredAt" = "lastAttempt",
    "reviewDueAt" = "lastAttempt" + INTERVAL '21 days'
WHERE "bestScore" = "total";
