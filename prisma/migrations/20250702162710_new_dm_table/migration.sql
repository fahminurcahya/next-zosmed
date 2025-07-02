/*
  Warnings:

  - You are about to drop the column `replyStatus` on the `direct_message` table. All the data in the column will be lost.
  - You are about to drop the column `replyText` on the `direct_message` table. All the data in the column will be lost.
  - The `attachments` column on the `direct_message` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `metadata` column on the `direct_message` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `threadId` on table `direct_message` required. This step will fail if there are existing NULL values in that column.
  - Made the column `senderId` on table `direct_message` required. This step will fail if there are existing NULL values in that column.
  - Made the column `senderUsername` on table `direct_message` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "zosmed"."MessageDirection" AS ENUM ('INCOMING', 'OUTGOING');

-- CreateEnum
CREATE TYPE "zosmed"."DeliveryStatus" AS ENUM ('SENT', 'DELIVERED', 'READ', 'FAILED');

-- AlterTable
ALTER TABLE "zosmed"."direct_message" DROP COLUMN "replyStatus",
DROP COLUMN "replyText",
ADD COLUMN     "deliveryStatus" "zosmed"."DeliveryStatus",
ADD COLUMN     "direction" "zosmed"."MessageDirection" NOT NULL DEFAULT 'INCOMING',
ADD COLUMN     "failureReason" TEXT,
ADD COLUMN     "replyMessageId" TEXT,
ADD COLUMN     "triggeredByCommentId" TEXT,
ALTER COLUMN "threadId" SET NOT NULL,
ALTER COLUMN "senderId" SET NOT NULL,
ALTER COLUMN "senderUsername" SET NOT NULL,
DROP COLUMN "attachments",
ADD COLUMN     "attachments" JSONB,
DROP COLUMN "metadata",
ADD COLUMN     "metadata" JSONB;

-- CreateIndex
CREATE INDEX "direct_message_integrationId_direction_idx" ON "zosmed"."direct_message"("integrationId", "direction");

-- CreateIndex
CREATE INDEX "direct_message_recipientId_idx" ON "zosmed"."direct_message"("recipientId");

-- CreateIndex
CREATE INDEX "direct_message_timestamp_idx" ON "zosmed"."direct_message"("timestamp");
