/*
  Warnings:

  - The `businessCategory` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `businessSize` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "zosmed"."business_categories" AS ENUM ('FB', 'FASHION', 'EDUCATION', 'HEALTH', 'TECHNOLOGY', 'RETAIL', 'OTHER');

-- CreateEnum
CREATE TYPE "zosmed"."business_sizes" AS ENUM ('SOLO', 'SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "zosmed"."onboarding_steps" AS ENUM ('BUSINESS_INFO', 'PLAN_SELECTION', 'INSTAGRAM_CONNECTION', 'COMPLETED');

-- AlterTable
ALTER TABLE "zosmed"."user" ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "onboardingStep" "zosmed"."onboarding_steps" NOT NULL DEFAULT 'BUSINESS_INFO',
DROP COLUMN "businessCategory",
ADD COLUMN     "businessCategory" "zosmed"."business_categories",
DROP COLUMN "businessSize",
ADD COLUMN     "businessSize" "zosmed"."business_sizes";
