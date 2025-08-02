/*
  Warnings:

  - You are about to drop the column `is_require_phone_number` on the `payment_channel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "zosmed"."payment_channel" DROP COLUMN "is_require_phone_number";
