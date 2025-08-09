-- AlterTable
ALTER TABLE "zosmed"."subscription" ALTER COLUMN "dm_reset_date" DROP NOT NULL,
ALTER COLUMN "dm_reset_date" DROP DEFAULT;
