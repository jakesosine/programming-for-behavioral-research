-- CreateTable
CREATE TABLE "Response" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "phase" INTEGER NOT NULL,
    "block" INTEGER NOT NULL,
    "button" TEXT NOT NULL,
    "reinforced" BOOLEAN NOT NULL,
    "respondedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Participant" ADD COLUMN "taskCompleted" BOOLEAN NOT NULL DEFAULT false;
