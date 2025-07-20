-- CreateEnum
CREATE TYPE "zosmed"."DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateTable
CREATE TABLE "zosmed"."discount_code" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "zosmed"."DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
    "value" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "maxUses" INTEGER,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "minPurchaseAmount" DOUBLE PRECISION,
    "applicablePlans" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "waitinglistId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discount_code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zosmed"."discount_usage" (
    "id" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderAmount" DOUBLE PRECISION NOT NULL,
    "discountAmount" DOUBLE PRECISION NOT NULL,
    "subscriptionId" TEXT,

    CONSTRAINT "discount_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "discount_code_code_key" ON "zosmed"."discount_code"("code");

-- CreateIndex
CREATE UNIQUE INDEX "discount_code_waitinglistId_key" ON "zosmed"."discount_code"("waitinglistId");

-- CreateIndex
CREATE INDEX "discount_code_code_isActive_idx" ON "zosmed"."discount_code"("code", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "discount_usage_discountId_userId_key" ON "zosmed"."discount_usage"("discountId", "userId");

-- AddForeignKey
ALTER TABLE "zosmed"."discount_code" ADD CONSTRAINT "discount_code_waitinglistId_fkey" FOREIGN KEY ("waitinglistId") REFERENCES "zosmed"."waiting_list"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."discount_usage" ADD CONSTRAINT "discount_usage_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "zosmed"."discount_code"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."discount_usage" ADD CONSTRAINT "discount_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zosmed"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
