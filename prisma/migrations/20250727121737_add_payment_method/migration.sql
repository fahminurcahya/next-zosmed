/*
  Warnings:

  - You are about to drop the column `subscriptionId` on the `recurring_plan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[subscription_id]` on the table `recurring_plan` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "zosmed"."recurring_plan" DROP CONSTRAINT "recurring_plan_subscriptionId_fkey";

-- DropIndex
DROP INDEX "zosmed"."recurring_plan_subscriptionId_key";

-- AlterTable
ALTER TABLE "zosmed"."recurring_plan" DROP COLUMN "subscriptionId",
ADD COLUMN     "subscription_id" UUID;

-- CreateTable
CREATE TABLE "zosmed"."payment_method" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "xendit_payment_method_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "channel_code" TEXT,
    "status" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "last_used_at" TIMESTAMP(3),
    "activated_at" TIMESTAMP(3),
    "expired_at" TIMESTAMP(3),
    "failure_code" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_method_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_method_xendit_payment_method_id_key" ON "zosmed"."payment_method"("xendit_payment_method_id");

-- CreateIndex
CREATE INDEX "payment_method_user_id_status_idx" ON "zosmed"."payment_method"("user_id", "status");

-- CreateIndex
CREATE INDEX "payment_method_xendit_payment_method_id_idx" ON "zosmed"."payment_method"("xendit_payment_method_id");

-- CreateIndex
CREATE UNIQUE INDEX "recurring_plan_subscription_id_key" ON "zosmed"."recurring_plan"("subscription_id");

-- AddForeignKey
ALTER TABLE "zosmed"."recurring_plan" ADD CONSTRAINT "recurring_plan_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "zosmed"."subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."payment_method" ADD CONSTRAINT "payment_method_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "zosmed"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
