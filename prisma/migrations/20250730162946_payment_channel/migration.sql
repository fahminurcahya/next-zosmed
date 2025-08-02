-- CreateEnum
CREATE TYPE "zosmed"."PaymentChannelType" AS ENUM ('VIRTUAL_ACCOUNT', 'EWALLET', 'QR_CODE', 'CREDIT_CARD', 'BANK_TRANSFER', 'DIRECT_DEBIT');

-- CreateEnum
CREATE TYPE "zosmed"."PaymentCategory" AS ENUM ('BANK_TRANSFER', 'DIGITAL_WALLET', 'CARD_PAYMENT', 'QR_PAYMENT');

-- CreateTable
CREATE TABLE "zosmed"."payment_channel" (
    "id" TEXT NOT NULL,
    "channel_code" TEXT NOT NULL,
    "channel_name" TEXT NOT NULL,
    "type" "zosmed"."PaymentChannelType" NOT NULL DEFAULT 'VIRTUAL_ACCOUNT',
    "category" "zosmed"."PaymentCategory" NOT NULL DEFAULT 'BANK_TRANSFER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_one_time_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_recurring_enabled" BOOLEAN NOT NULL DEFAULT false,
    "logo" TEXT,
    "bg_color" TEXT,
    "text_color" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "min_amount" DOUBLE PRECISION,
    "max_amount" DOUBLE PRECISION,
    "processing_fee" DOUBLE PRECISION,
    "percentage_fee" DOUBLE PRECISION,
    "allowed_for_plans" TEXT[],
    "description" TEXT,
    "customer_message" TEXT,
    "xendit_channel_code" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_channel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_channel_channel_code_key" ON "zosmed"."payment_channel"("channel_code");

-- CreateIndex
CREATE INDEX "payment_channel_is_active_sort_order_idx" ON "zosmed"."payment_channel"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "payment_channel_type_is_active_idx" ON "zosmed"."payment_channel"("type", "is_active");

-- CreateIndex
CREATE INDEX "payment_channel_is_one_time_enabled_idx" ON "zosmed"."payment_channel"("is_one_time_enabled");

-- CreateIndex
CREATE INDEX "payment_channel_is_recurring_enabled_idx" ON "zosmed"."payment_channel"("is_recurring_enabled");
