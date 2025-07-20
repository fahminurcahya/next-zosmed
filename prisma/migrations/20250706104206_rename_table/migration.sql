/*
  Warnings:

  - You are about to drop the `WebhookError` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WebhookEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `waitinglist` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "zosmed"."WebhookError";

-- DropTable
DROP TABLE "zosmed"."WebhookEvent";

-- DropTable
DROP TABLE "zosmed"."waitinglist";

-- CreateTable
CREATE TABLE "zosmed"."waiting_list" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "referralSource" TEXT,
    "interestedPlan" "zosmed"."SUBSCRIPTION_PLAN" NOT NULL DEFAULT 'FREE',
    "isNotified" BOOLEAN NOT NULL DEFAULT false,
    "notifiedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waiting_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."webhook_event" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "headers" TEXT,
    "metadata" TEXT,
    "errorMessage" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "webhook_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."webhook_error" (
    "id" TEXT NOT NULL,
    "webhookEventId" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "error" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_error_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "waiting_list_email_key" ON "zosmed"."waiting_list"("email");

-- CreateIndex
CREATE INDEX "waiting_list_email_idx" ON "zosmed"."waiting_list"("email");

-- CreateIndex
CREATE INDEX "waiting_list_isNotified_idx" ON "zosmed"."waiting_list"("isNotified");

-- CreateIndex
CREATE INDEX "webhook_event_source_status_idx" ON "zosmed"."webhook_event"("source", "status");

-- CreateIndex
CREATE INDEX "webhook_event_receivedAt_idx" ON "zosmed"."webhook_event"("receivedAt");

-- CreateIndex
CREATE INDEX "webhook_error_webhookEventId_idx" ON "zosmed"."webhook_error"("webhookEventId");

-- CreateIndex
CREATE INDEX "webhook_error_integrationId_idx" ON "zosmed"."webhook_error"("integrationId");
