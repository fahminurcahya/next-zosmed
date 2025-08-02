/*
  Warnings:

  - Added the required column `channel` to the `notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "zosmed"."notification" ADD COLUMN     "channel" TEXT NOT NULL,
ADD COLUMN     "error" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "retry_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "scheduled_at" TIMESTAMP(3),
ADD COLUMN     "sent_at" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "title" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "notification_status_scheduled_at_idx" ON "zosmed"."notification"("status", "scheduled_at");
