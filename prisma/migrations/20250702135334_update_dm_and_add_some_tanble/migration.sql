/*
  Warnings:

  - Added the required column `updatedAt` to the `comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `direct_message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "zosmed"."comment" ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "zosmed"."direct_message" ADD COLUMN     "attachments" JSONB,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "recipientId" TEXT,
ADD COLUMN     "recipientUsername" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "zosmed"."WebhookEvent" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "headers" JSONB,
    "metadata" JSONB,
    "errorMessage" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."WebhookError" (
    "id" TEXT NOT NULL,
    "webhookEventId" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "error" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookError_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebhookEvent_source_status_idx" ON "zosmed"."WebhookEvent"("source", "status");

-- CreateIndex
CREATE INDEX "WebhookEvent_receivedAt_idx" ON "zosmed"."WebhookEvent"("receivedAt");

-- CreateIndex
CREATE INDEX "WebhookError_webhookEventId_idx" ON "zosmed"."WebhookError"("webhookEventId");

-- CreateIndex
CREATE INDEX "WebhookError_integrationId_idx" ON "zosmed"."WebhookError"("integrationId");

-- CreateIndex
CREATE INDEX "direct_message_senderId_idx" ON "zosmed"."direct_message"("senderId");
