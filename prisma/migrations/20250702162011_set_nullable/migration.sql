-- AlterTable
ALTER TABLE "zosmed"."direct_message" ALTER COLUMN "threadId" DROP NOT NULL,
ALTER COLUMN "senderId" DROP NOT NULL,
ALTER COLUMN "senderUsername" DROP NOT NULL;
