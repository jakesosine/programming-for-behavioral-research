-- CreateTable
CREATE TABLE "Demographics" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "education" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Demographics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Demographics_participantId_key" ON "Demographics"("participantId");

-- AddForeignKey
ALTER TABLE "Demographics" ADD CONSTRAINT "Demographics_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
