-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "lastReportSentAt" TIMESTAMP(3),
ADD COLUMN     "timeZone" TEXT,
ADD COLUMN     "weeklyReport" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ParentLink" ADD COLUMN     "nickname" TEXT;

-- CreateTable
CREATE TABLE "ParentInvite" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "nickname" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "ParentInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonView" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subskillId" TEXT NOT NULL,
    "ms" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParentInvite_token_key" ON "ParentInvite"("token");

-- CreateIndex
CREATE INDEX "LessonView_userId_createdAt_idx" ON "LessonView"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "ParentInvite" ADD CONSTRAINT "ParentInvite_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonView" ADD CONSTRAINT "LessonView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

