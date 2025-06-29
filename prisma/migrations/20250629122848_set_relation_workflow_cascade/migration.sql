/*
  Warnings:

  - Made the column `integrationId` on table `workflow` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "zosmed"."workflow" DROP CONSTRAINT "workflow_integrationId_fkey";

-- AlterTable
ALTER TABLE "zosmed"."workflow" ALTER COLUMN "integrationId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "zosmed"."workflow" ADD CONSTRAINT "workflow_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "zosmed"."integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
