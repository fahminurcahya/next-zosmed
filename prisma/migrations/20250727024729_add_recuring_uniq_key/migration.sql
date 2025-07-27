/*
  Warnings:

  - You are about to drop the column `next_charge_date` on the `recurring_plan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[subscriptionId]` on the table `recurring_plan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[recurring_plan_id]` on the table `subscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `amount` to the `recurring_plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricing_plan_id` to the `recurring_plan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "zosmed"."recurring_plan" DROP COLUMN "next_charge_date",
ADD COLUMN     "activated_at" TIMESTAMP(3),
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "deactivated_at" TIMESTAMP(3),
ADD COLUMN     "discount_amount" DOUBLE PRECISION,
ADD COLUMN     "discount_code" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "paused_at" TIMESTAMP(3),
ADD COLUMN     "pricing_plan_id" TEXT NOT NULL,
ADD COLUMN     "subscriptionId" UUID;

-- AlterTable
ALTER TABLE "zosmed"."subscription" ADD COLUMN     "is_recurring" BOOLEAN DEFAULT false,
ADD COLUMN     "last_payment_at" TIMESTAMP(3),
ADD COLUMN     "recurring_plan_id" TEXT;

-- CreateTable
CREATE TABLE "zosmed"."recurring_cycle" (
    "id" TEXT NOT NULL,
    "cycle_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "status" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "succeeded_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "cycle_number" INTEGER NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recurring_cycle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recurring_cycle_cycle_id_key" ON "zosmed"."recurring_cycle"("cycle_id");

-- CreateIndex
CREATE INDEX "recurring_cycle_plan_id_status_idx" ON "zosmed"."recurring_cycle"("plan_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "recurring_plan_subscriptionId_key" ON "zosmed"."recurring_plan"("subscriptionId");

-- CreateIndex
CREATE INDEX "recurring_plan_user_id_status_idx" ON "zosmed"."recurring_plan"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_recurring_plan_id_key" ON "zosmed"."subscription"("recurring_plan_id");

-- AddForeignKey
ALTER TABLE "zosmed"."recurring_plan" ADD CONSTRAINT "recurring_plan_pricing_plan_id_fkey" FOREIGN KEY ("pricing_plan_id") REFERENCES "zosmed"."pricing_plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."recurring_plan" ADD CONSTRAINT "recurring_plan_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "zosmed"."subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
