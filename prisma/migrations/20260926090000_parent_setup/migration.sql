-- AlterTable
ALTER TABLE "User" ADD COLUMN     "parentOptOutAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "setupEmailSentAt" TIMESTAMP(3),
ADD COLUMN     "setupToken" TEXT,
ADD COLUMN     "setupTokenExpires" TIMESTAMP(3),
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Parent_setupToken_key" ON "Parent"("setupToken");

