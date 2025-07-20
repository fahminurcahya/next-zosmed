-- CreateEnum
CREATE TYPE "zosmed"."PricingPeriod" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY', 'LIFETIME');

-- AlterTable
ALTER TABLE "zosmed"."subscription" ADD COLUMN     "customPlan" JSONB,
ADD COLUMN     "pricingPlanId" TEXT;

-- CreateTable
CREATE TABLE "zosmed"."pricing_plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "period" "zosmed"."PricingPeriod" NOT NULL DEFAULT 'MONTHLY',
    "color" TEXT NOT NULL,
    "bgColor" TEXT NOT NULL,
    "borderColor" TEXT NOT NULL,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "badge" TEXT,
    "maxAccounts" INTEGER NOT NULL DEFAULT 1,
    "maxDMPerMonth" INTEGER NOT NULL DEFAULT 100,
    "maxAIReplyPerMonth" INTEGER NOT NULL DEFAULT 0,
    "features" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."plan_feature" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_feature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pricing_plan_name_key" ON "zosmed"."pricing_plan"("name");

-- CreateIndex
CREATE INDEX "pricing_plan_isActive_sortOrder_idx" ON "zosmed"."pricing_plan"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "plan_feature_key_key" ON "zosmed"."plan_feature"("key");

-- CreateIndex
CREATE INDEX "plan_feature_category_isActive_idx" ON "zosmed"."plan_feature"("category", "isActive");

-- AddForeignKey
ALTER TABLE "zosmed"."subscription" ADD CONSTRAINT "subscription_pricingPlanId_fkey" FOREIGN KEY ("pricingPlanId") REFERENCES "zosmed"."pricing_plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
