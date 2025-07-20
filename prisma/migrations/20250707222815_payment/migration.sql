-- CreateEnum
CREATE TYPE "zosmed"."PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'EXPIRED', 'REFUNDED');

-- CreateTable
CREATE TABLE "zosmed"."payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT,
    "externalId" TEXT NOT NULL,
    "xenditInvoiceId" TEXT,
    "xenditInvoiceUrl" TEXT,
    "xenditRecurringId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "status" "zosmed"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "paymentChannel" TEXT,
    "discountCode" TEXT,
    "discountAmount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_externalId_key" ON "zosmed"."payment"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_xenditInvoiceId_key" ON "zosmed"."payment"("xenditInvoiceId");

-- CreateIndex
CREATE INDEX "payment_userId_status_idx" ON "zosmed"."payment"("userId", "status");

-- CreateIndex
CREATE INDEX "payment_externalId_idx" ON "zosmed"."payment"("externalId");

-- AddForeignKey
ALTER TABLE "zosmed"."payment" ADD CONSTRAINT "payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zosmed"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zosmed"."payment" ADD CONSTRAINT "payment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "zosmed"."pricing_plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
