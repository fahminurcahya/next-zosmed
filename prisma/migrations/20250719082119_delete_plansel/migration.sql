/*
  Warnings:

  - The values [PLAN_SELECTION] on the enum `onboarding_steps` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "zosmed"."onboarding_steps_new" AS ENUM ('BUSINESS_INFO', 'INSTAGRAM_CONNECTION', 'COMPLETED');
ALTER TABLE "zosmed"."user" ALTER COLUMN "onboardingStep" DROP DEFAULT;
ALTER TABLE "zosmed"."user" ALTER COLUMN "onboardingStep" TYPE "zosmed"."onboarding_steps_new" USING ("onboardingStep"::text::"zosmed"."onboarding_steps_new");
ALTER TYPE "zosmed"."onboarding_steps" RENAME TO "onboarding_steps_old";
ALTER TYPE "zosmed"."onboarding_steps_new" RENAME TO "onboarding_steps";
DROP TYPE "zosmed"."onboarding_steps_old";
ALTER TABLE "zosmed"."user" ALTER COLUMN "onboardingStep" SET DEFAULT 'BUSINESS_INFO';
COMMIT;
