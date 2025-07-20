-- CreateTable
CREATE TABLE "zosmed"."waitinglist" (
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

    CONSTRAINT "waitinglist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "waitinglist_email_key" ON "zosmed"."waitinglist"("email");

-- CreateIndex
CREATE INDEX "waitinglist_email_idx" ON "zosmed"."waitinglist"("email");

-- CreateIndex
CREATE INDEX "waitinglist_isNotified_idx" ON "zosmed"."waitinglist"("isNotified");
