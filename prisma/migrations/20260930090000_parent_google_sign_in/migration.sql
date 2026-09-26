-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "googleSub" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Parent_googleSub_key" ON "Parent"("googleSub");

