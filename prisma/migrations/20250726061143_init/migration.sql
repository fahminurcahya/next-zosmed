-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "zosmed";

-- CreateEnum
CREATE TYPE "zosmed"."business_categories" AS ENUM ('FB', 'FASHION', 'EDUCATION', 'HEALTH', 'TECHNOLOGY', 'RETAIL', 'OTHER');

-- CreateEnum
CREATE TYPE "zosmed"."business_sizes" AS ENUM ('SOLO', 'SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "zosmed"."onboarding_steps" AS ENUM ('BUSINESS_INFO', 'INSTAGRAM_CONNECTION', 'COMPLETED');

-- CreateEnum
CREATE TYPE "zosmed"."SUBSCRIPTION_PLAN" AS ENUM ('FREE', 'STARTER', 'PRO');

-- CreateEnum
CREATE TYPE "zosmed"."SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PAST_DUE', 'CANCELED');

-- CreateEnum
CREATE TYPE "zosmed"."INTEGRATION_TYPE" AS ENUM ('INSTAGRAM');

-- CreateEnum
CREATE TYPE "zosmed"."MessageDirection" AS ENUM ('INCOMING', 'OUTGOING');

-- CreateEnum
CREATE TYPE "zosmed"."DeliveryStatus" AS ENUM ('SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "zosmed"."ReplyStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "zosmed"."WorkflowTriggerType" AS ENUM ('COMMENT_RECEIVED', 'DM_RECEIVED');

-- CreateEnum
CREATE TYPE "zosmed"."WorkflowStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ERROR');

-- CreateEnum
CREATE TYPE "zosmed"."WorkflowExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "zosmed"."ExecutionPhaseStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "zosmed"."LogLevel" AS ENUM ('DEBUG', 'INFO', 'WARNING', 'ERROR');

-- CreateEnum
CREATE TYPE "zosmed"."DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "zosmed"."PricingPeriod" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY', 'LIFETIME');

-- CreateEnum
CREATE TYPE "zosmed"."PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'EXPIRED', 'REFUNDED', 'ABANDONED');

-- CreateTable
CREATE TABLE "zosmed"."waiting_list" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "referral_source" TEXT,
    "interested_plan" "zosmed"."SUBSCRIPTION_PLAN" NOT NULL DEFAULT 'FREE',
    "is_notified" BOOLEAN NOT NULL DEFAULT false,
    "notified_at" TIMESTAMP(3),
    "ip_address" TEXT,
    "user_agent" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waiting_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'customer',
    "has_onboarding" BOOLEAN NOT NULL DEFAULT false,
    "business_name" TEXT,
    "business_category" "zosmed"."business_categories",
    "business_size" "zosmed"."business_sizes",
    "location" TEXT,
    "goals" TEXT,
    "onboarding_step" "zosmed"."onboarding_steps" NOT NULL DEFAULT 'BUSINESS_INFO',
    "onboarding_completed_at" TIMESTAMP(3),
    "agreements" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."session" (
    "id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."account" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMP(3),
    "refresh_token_expires_at" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."subscription" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "plan" "zosmed"."SUBSCRIPTION_PLAN" NOT NULL DEFAULT 'FREE',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "max_accounts" INTEGER NOT NULL DEFAULT 1,
    "max_dm_per_month" INTEGER NOT NULL DEFAULT 100,
    "current_dm_count" INTEGER NOT NULL DEFAULT 0,
    "dm_reset_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "has_ai_reply" BOOLEAN NOT NULL DEFAULT false,
    "has_ai_sales_predictor" BOOLEAN NOT NULL DEFAULT false,
    "max_ai_reply_per_month" INTEGER NOT NULL DEFAULT 100,
    "status" "zosmed"."SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "current_period_start" TIMESTAMP(3),
    "current_period_end" TIMESTAMP(3),
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "pricing_plan_id" TEXT,
    "custom_plan" JSONB,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."integration" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "zosmed"."INTEGRATION_TYPE" NOT NULL DEFAULT 'INSTAGRAM',
    "account_username" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "token_type" TEXT,
    "scope" TEXT,
    "expires_at" TIMESTAMP(3),
    "last_sync_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."direct_message" (
    "id" TEXT NOT NULL,
    "integration_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "direction" "zosmed"."MessageDirection" NOT NULL DEFAULT 'INCOMING',
    "sender_id" TEXT NOT NULL,
    "sender_username" TEXT NOT NULL,
    "recipient_id" TEXT,
    "recipient_username" TEXT,
    "text" TEXT NOT NULL,
    "attachments" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_replied" BOOLEAN NOT NULL DEFAULT false,
    "replied_at" TIMESTAMP(3),
    "reply_message_id" TEXT,
    "delivery_status" "zosmed"."DeliveryStatus",
    "failure_reason" TEXT,
    "workflow_execution_id" TEXT,
    "triggered_by_comment_id" TEXT,
    "metadata" JSONB,

    CONSTRAINT "direct_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."comment" (
    "id" TEXT NOT NULL,
    "integration_id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "is_replied" BOOLEAN NOT NULL DEFAULT false,
    "replied_at" TIMESTAMP(3),
    "reply_text" TEXT,
    "reply_status" "zosmed"."ReplyStatus",
    "dm_sent" BOOLEAN NOT NULL DEFAULT false,
    "dm_sent_at" TIMESTAMP(3),
    "workflow_execution_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."workflow" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "integration_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "definition" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "trigger_type" "zosmed"."WorkflowTriggerType" NOT NULL,
    "last_run_at" TIMESTAMP(3),
    "last_run_status" "zosmed"."WorkflowExecutionStatus",
    "total_runs" INTEGER NOT NULL DEFAULT 0,
    "successful_runs" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."workflow_execution" (
    "id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "status" "zosmed"."WorkflowExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "definition" TEXT NOT NULL DEFAULT '{}',
    "credits_consumed" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT,
    "error_message" TEXT,

    CONSTRAINT "workflow_execution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."execution_phase" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "zosmed"."ExecutionPhaseStatus" NOT NULL DEFAULT 'PENDING',
    "number" INTEGER NOT NULL,
    "node" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "inputs" TEXT,
    "outputs" TEXT,
    "error_message" TEXT,
    "credits_consumed" INTEGER,
    "workflow_execution_id" TEXT NOT NULL,

    CONSTRAINT "execution_phase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."execution_log" (
    "id" TEXT NOT NULL,
    "log_level" "zosmed"."LogLevel" NOT NULL DEFAULT 'INFO',
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "execution_phase_id" TEXT NOT NULL,

    CONSTRAINT "execution_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."workflow_template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."notification" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT,
    "is_seen" BOOLEAN NOT NULL DEFAULT false,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."usage_tracking" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "integration_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "dm_sent" INTEGER NOT NULL DEFAULT 0,
    "comment_replied" INTEGER NOT NULL DEFAULT 0,
    "workflow_runs" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."webhook_event" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "headers" TEXT,
    "metadata" TEXT,
    "error_message" TEXT,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "webhook_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."webhook_error" (
    "id" TEXT NOT NULL,
    "webhook_event_id" TEXT NOT NULL,
    "integration_id" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "error" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_error_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."discount_code" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "zosmed"."DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
    "value" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "valid_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMP(3),
    "max_uses" INTEGER,
    "current_uses" INTEGER NOT NULL DEFAULT 0,
    "min_purchase_amount" DOUBLE PRECISION,
    "applicable_plans" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "waitinglist_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discount_code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."discount_usage" (
    "id" TEXT NOT NULL,
    "discount_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "order_amount" DOUBLE PRECISION NOT NULL,
    "discount_amount" DOUBLE PRECISION NOT NULL,
    "subscription_id" TEXT,

    CONSTRAINT "discount_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."pricing_plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "period" "zosmed"."PricingPeriod" NOT NULL DEFAULT 'MONTHLY',
    "color" TEXT NOT NULL,
    "bg_color" TEXT NOT NULL,
    "border_color" TEXT NOT NULL,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "badge" TEXT,
    "max_accounts" INTEGER NOT NULL DEFAULT 1,
    "max_dm_per_month" INTEGER NOT NULL DEFAULT 100,
    "max_ai_reply_per_month" INTEGER NOT NULL DEFAULT 0,
    "features" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."payment" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_id" TEXT,
    "external_id" TEXT NOT NULL,
    "xendit_invoice_id" TEXT,
    "xendit_invoice_url" TEXT,
    "xendit_recurring_id" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "status" "zosmed"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_method" TEXT,
    "payment_channel" TEXT,
    "discount_code" TEXT,
    "discount_amount" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),
    "expired_at" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "waiting_list_email_key" ON "zosmed"."waiting_list"("email");

-- CreateIndex
CREATE INDEX "waiting_list_email_idx" ON "zosmed"."waiting_list"("email");

-- CreateIndex
CREATE INDEX "waiting_list_is_notified_idx" ON "zosmed"."waiting_list"("is_notified");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "zosmed"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "zosmed"."session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_user_id_key" ON "zosmed"."subscription"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "integration_account_id_key" ON "zosmed"."integration"("account_id");

-- CreateIndex
CREATE INDEX "integration_user_id_idx" ON "zosmed"."integration"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "integration_user_id_account_id_key" ON "zosmed"."integration"("user_id", "account_id");

-- CreateIndex
CREATE UNIQUE INDEX "direct_message_message_id_key" ON "zosmed"."direct_message"("message_id");

-- CreateIndex
CREATE INDEX "direct_message_integration_id_direction_idx" ON "zosmed"."direct_message"("integration_id", "direction");

-- CreateIndex
CREATE INDEX "direct_message_integration_id_is_replied_idx" ON "zosmed"."direct_message"("integration_id", "is_replied");

-- CreateIndex
CREATE INDEX "direct_message_thread_id_idx" ON "zosmed"."direct_message"("thread_id");

-- CreateIndex
CREATE INDEX "direct_message_sender_id_idx" ON "zosmed"."direct_message"("sender_id");

-- CreateIndex
CREATE INDEX "direct_message_recipient_id_idx" ON "zosmed"."direct_message"("recipient_id");

-- CreateIndex
CREATE INDEX "direct_message_timestamp_idx" ON "zosmed"."direct_message"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "comment_comment_id_key" ON "zosmed"."comment"("comment_id");

-- CreateIndex
CREATE INDEX "comment_integration_id_is_replied_idx" ON "zosmed"."comment"("integration_id", "is_replied");

-- CreateIndex
CREATE INDEX "comment_post_id_idx" ON "zosmed"."comment"("post_id");

-- CreateIndex
CREATE INDEX "workflow_integration_id_is_active_idx" ON "zosmed"."workflow"("integration_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_name_user_id_key" ON "zosmed"."workflow"("name", "user_id");

-- CreateIndex
CREATE INDEX "usage_tracking_user_id_date_idx" ON "zosmed"."usage_tracking"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "usage_tracking_user_id_integration_id_date_key" ON "zosmed"."usage_tracking"("user_id", "integration_id", "date");

-- CreateIndex
CREATE INDEX "webhook_event_source_status_idx" ON "zosmed"."webhook_event"("source", "status");

-- CreateIndex
CREATE INDEX "webhook_event_received_at_idx" ON "zosmed"."webhook_event"("received_at");

-- CreateIndex
CREATE INDEX "webhook_error_webhook_event_id_idx" ON "zosmed"."webhook_error"("webhook_event_id");

-- CreateIndex
CREATE INDEX "webhook_error_integration_id_idx" ON "zosmed"."webhook_error"("integration_id");

-- CreateIndex
CREATE UNIQUE INDEX "discount_code_code_key" ON "zosmed"."discount_code"("code");

-- CreateIndex
CREATE UNIQUE INDEX "discount_code_waitinglist_id_key" ON "zosmed"."discount_code"("waitinglist_id");

-- CreateIndex
CREATE INDEX "discount_code_code_is_active_idx" ON "zosmed"."discount_code"("code", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "discount_usage_discount_id_user_id_key" ON "zosmed"."discount_usage"("discount_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_plan_name_key" ON "zosmed"."pricing_plan"("name");

-- CreateIndex
CREATE INDEX "pricing_plan_is_active_sort_order_idx" ON "zosmed"."pricing_plan"("is_active", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "payment_external_id_key" ON "zosmed"."payment"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_xendit_invoice_id_key" ON "zosmed"."payment"("xendit_invoice_id");

-- CreateIndex
CREATE INDEX "payment_user_id_status_idx" ON "zosmed"."payment"("user_id", "status");

-- CreateIndex
CREATE INDEX "payment_external_id_idx" ON "zosmed"."payment"("external_id");

-- AddForeignKey
ALTER TABLE "zosmed"."session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "zosmed"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "zosmed"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."subscription" ADD CONSTRAINT "subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "zosmed"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."subscription" ADD CONSTRAINT "subscription_pricing_plan_id_fkey" FOREIGN KEY ("pricing_plan_id") REFERENCES "zosmed"."pricing_plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."integration" ADD CONSTRAINT "integration_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "zosmed"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."direct_message" ADD CONSTRAINT "direct_message_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "zosmed"."integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."comment" ADD CONSTRAINT "comment_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "zosmed"."integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."workflow" ADD CONSTRAINT "workflow_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "zosmed"."integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."workflow" ADD CONSTRAINT "workflow_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "zosmed"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."workflow_execution" ADD CONSTRAINT "workflow_execution_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "zosmed"."workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."execution_phase" ADD CONSTRAINT "execution_phase_workflow_execution_id_fkey" FOREIGN KEY ("workflow_execution_id") REFERENCES "zosmed"."workflow_execution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."execution_log" ADD CONSTRAINT "execution_log_execution_phase_id_fkey" FOREIGN KEY ("execution_phase_id") REFERENCES "zosmed"."execution_phase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "zosmed"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."usage_tracking" ADD CONSTRAINT "usage_tracking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "zosmed"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."usage_tracking" ADD CONSTRAINT "usage_tracking_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "zosmed"."integration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."discount_code" ADD CONSTRAINT "discount_code_waitinglist_id_fkey" FOREIGN KEY ("waitinglist_id") REFERENCES "zosmed"."waiting_list"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."discount_usage" ADD CONSTRAINT "discount_usage_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "zosmed"."discount_code"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."discount_usage" ADD CONSTRAINT "discount_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "zosmed"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."payment" ADD CONSTRAINT "payment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "zosmed"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."payment" ADD CONSTRAINT "payment_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "zosmed"."pricing_plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
