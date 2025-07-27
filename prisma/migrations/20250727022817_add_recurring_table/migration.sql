-- AlterTable
ALTER TABLE "zosmed"."payment" ADD COLUMN     "is_recurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recurring_cycle_id" TEXT;

-- CreateTable
CREATE TABLE "zosmed"."recurring_plan" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "xendit_plan_id" TEXT NOT NULL,
    "xendit_customer_id" TEXT NOT NULL,
    "payment_method_id" TEXT,
    "status" TEXT NOT NULL,
    "next_charge_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recurring_plan_xendit_plan_id_key" ON "zosmed"."recurring_plan"("xendit_plan_id");

-- AddForeignKey
ALTER TABLE "zosmed"."recurring_plan" ADD CONSTRAINT "recurring_plan_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "zosmed"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
