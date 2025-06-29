/*
  Warnings:

  - The values [MANUAL] on the enum `WorkflowTriggerType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "zosmed"."WorkflowTriggerType_new" AS ENUM ('COMMENT_RECEIVED', 'DM_RECEIVED');
ALTER TABLE "zosmed"."workflow" ALTER COLUMN "triggerType" TYPE "zosmed"."WorkflowTriggerType_new" USING ("triggerType"::text::"zosmed"."WorkflowTriggerType_new");
ALTER TYPE "zosmed"."WorkflowTriggerType" RENAME TO "WorkflowTriggerType_old";
ALTER TYPE "zosmed"."WorkflowTriggerType_new" RENAME TO "WorkflowTriggerType";
DROP TYPE "zosmed"."WorkflowTriggerType_old";
COMMIT;
