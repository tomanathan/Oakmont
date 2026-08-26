-- Remove XP (no longer shown or awarded)
ALTER TABLE "User" DROP COLUMN "totalXP";

-- Study goals used to build a custom-length timeline
ALTER TABLE "User" ADD COLUMN "baselineScore" INTEGER;
ALTER TABLE "User" ADD COLUMN "goalScore" INTEGER;
ALTER TABLE "User" ADD COLUMN "targetTestDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PracticeTest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "compositeScore" INTEGER NOT NULL,
    "rwScore" INTEGER NOT NULL,
    "mathScore" INTEGER NOT NULL,
    "domainScores" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PracticeTest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PracticeTest_userId_takenAt_idx" ON "PracticeTest"("userId", "takenAt");

-- AddForeignKey
ALTER TABLE "PracticeTest" ADD CONSTRAINT "PracticeTest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
