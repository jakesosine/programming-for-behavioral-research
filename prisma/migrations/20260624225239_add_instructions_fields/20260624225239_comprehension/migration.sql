-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "comprehensionAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "instructionsCompleted" BOOLEAN NOT NULL DEFAULT false;
