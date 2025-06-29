/*
  Warnings:

  - You are about to drop the column `isActive` on the `integration` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "zosmed"."integration_userId_isActive_idx";

-- AlterTable
ALTER TABLE "zosmed"."integration" DROP COLUMN "isActive";

-- CreateIndex
CREATE INDEX "integration_userId_idx" ON "zosmed"."integration"("userId");
