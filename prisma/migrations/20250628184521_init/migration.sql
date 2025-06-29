-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "zosmed";

-- CreateEnum
CREATE TYPE "zosmed"."SUBSCRIPTION_PLAN" AS ENUM ('FREE', 'STARTER', 'PRO');

-- CreateEnum
CREATE TYPE "zosmed"."SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PAST_DUE', 'CANCELED');

-- CreateEnum
CREATE TYPE "zosmed"."INTEGRATION_TYPE" AS ENUM ('INSTAGRAM');

-- CreateEnum
CREATE TYPE "zosmed"."ReplyStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "zosmed"."WorkflowTriggerType" AS ENUM ('COMMENT_RECEIVED', 'DM_RECEIVED', 'MANUAL');

-- CreateEnum
CREATE TYPE "zosmed"."WorkflowStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ERROR');

-- CreateEnum
CREATE TYPE "zosmed"."WorkflowExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "zosmed"."ExecutionPhaseStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "zosmed"."LogLevel" AS ENUM ('DEBUG', 'INFO', 'WARNING', 'ERROR');

-- CreateTable
CREATE TABLE "zosmed"."user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."subscription" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "plan" "zosmed"."SUBSCRIPTION_PLAN" NOT NULL DEFAULT 'FREE',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maxAccounts" INTEGER NOT NULL DEFAULT 1,
    "maxDMPerMonth" INTEGER NOT NULL DEFAULT 100,
    "currentDMCount" INTEGER NOT NULL DEFAULT 0,
    "dmResetDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hasAIReply" BOOLEAN NOT NULL DEFAULT false,
    "hasAISalesPredictor" BOOLEAN NOT NULL DEFAULT false,
    "status" "zosmed"."SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."integration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "zosmed"."INTEGRATION_TYPE" NOT NULL DEFAULT 'INSTAGRAM',
    "accountUsername" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenType" TEXT,
    "scope" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."direct_message" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderUsername" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "isReplied" BOOLEAN NOT NULL DEFAULT false,
    "repliedAt" TIMESTAMP(3),
    "replyText" TEXT,
    "replyStatus" "zosmed"."ReplyStatus",
    "workflowExecutionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "direct_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."comment" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isReplied" BOOLEAN NOT NULL DEFAULT false,
    "repliedAt" TIMESTAMP(3),
    "replyText" TEXT,
    "replyStatus" "zosmed"."ReplyStatus",
    "dmSent" BOOLEAN NOT NULL DEFAULT false,
    "dmSentAt" TIMESTAMP(3),
    "workflowExecutionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."workflow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "integrationId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "definition" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "triggerType" "zosmed"."WorkflowTriggerType" NOT NULL,
    "lastRunAt" TIMESTAMP(3),
    "lastRunStatus" "zosmed"."WorkflowExecutionStatus",
    "totalRuns" INTEGER NOT NULL DEFAULT 0,
    "successfulRuns" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."workflow_execution" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "status" "zosmed"."WorkflowExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "definition" TEXT NOT NULL DEFAULT '{}',
    "creditsConsumed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "workflow_execution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."execution_phase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "zosmed"."ExecutionPhaseStatus" NOT NULL DEFAULT 'PENDING',
    "number" INTEGER NOT NULL,
    "node" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "inputs" TEXT,
    "outputs" TEXT,
    "errorMessage" TEXT,
    "creditsConsumed" INTEGER,
    "workflowExecutionId" TEXT NOT NULL,

    CONSTRAINT "execution_phase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."execution_log" (
    "id" TEXT NOT NULL,
    "logLevel" "zosmed"."LogLevel" NOT NULL DEFAULT 'INFO',
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executionPhaseId" TEXT NOT NULL,

    CONSTRAINT "execution_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."workflow_template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."notification" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT,
    "isSeen" BOOLEAN NOT NULL DEFAULT false,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."usage_tracking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "dmSent" INTEGER NOT NULL DEFAULT 0,
    "commentReplied" INTEGER NOT NULL DEFAULT 0,
    "workflowRuns" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "zosmed"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "zosmed"."session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_userId_key" ON "zosmed"."subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "integration_accountId_key" ON "zosmed"."integration"("accountId");

-- CreateIndex
CREATE INDEX "integration_userId_isActive_idx" ON "zosmed"."integration"("userId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "integration_userId_accountId_key" ON "zosmed"."integration"("userId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "direct_message_messageId_key" ON "zosmed"."direct_message"("messageId");

-- CreateIndex
CREATE INDEX "direct_message_integrationId_isReplied_idx" ON "zosmed"."direct_message"("integrationId", "isReplied");

-- CreateIndex
CREATE INDEX "direct_message_threadId_idx" ON "zosmed"."direct_message"("threadId");

-- CreateIndex
CREATE UNIQUE INDEX "comment_commentId_key" ON "zosmed"."comment"("commentId");

-- CreateIndex
CREATE INDEX "comment_integrationId_isReplied_idx" ON "zosmed"."comment"("integrationId", "isReplied");

-- CreateIndex
CREATE INDEX "comment_postId_idx" ON "zosmed"."comment"("postId");

-- CreateIndex
CREATE INDEX "workflow_integrationId_isActive_idx" ON "zosmed"."workflow"("integrationId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_name_userId_key" ON "zosmed"."workflow"("name", "userId");

-- CreateIndex
CREATE INDEX "usage_tracking_userId_date_idx" ON "zosmed"."usage_tracking"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "usage_tracking_userId_integrationId_date_key" ON "zosmed"."usage_tracking"("userId", "integrationId", "date");

-- AddForeignKey
ALTER TABLE "zosmed"."session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zosmed"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zosmed"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."subscription" ADD CONSTRAINT "subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zosmed"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."integration" ADD CONSTRAINT "integration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zosmed"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."direct_message" ADD CONSTRAINT "direct_message_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "zosmed"."integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."comment" ADD CONSTRAINT "comment_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "zosmed"."integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."workflow" ADD CONSTRAINT "workflow_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "zosmed"."integration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."workflow" ADD CONSTRAINT "workflow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zosmed"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."workflow_execution" ADD CONSTRAINT "workflow_execution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "zosmed"."workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."execution_phase" ADD CONSTRAINT "execution_phase_workflowExecutionId_fkey" FOREIGN KEY ("workflowExecutionId") REFERENCES "zosmed"."workflow_execution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."execution_log" ADD CONSTRAINT "execution_log_executionPhaseId_fkey" FOREIGN KEY ("executionPhaseId") REFERENCES "zosmed"."execution_phase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zosmed"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."usage_tracking" ADD CONSTRAINT "usage_tracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zosmed"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."usage_tracking" ADD CONSTRAINT "usage_tracking_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "zosmed"."integration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
