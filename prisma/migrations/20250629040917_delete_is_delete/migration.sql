/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `integration` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `integration` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "zosmed"."integration" DROP COLUMN "deletedAt",
DROP COLUMN "isDeleted";
