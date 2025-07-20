/*
  Warnings:

  - You are about to drop the `plan_feature` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "zosmed"."user" ADD COLUMN     "hasOnboarding" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "zosmed"."plan_feature";
