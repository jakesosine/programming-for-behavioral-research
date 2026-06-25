-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "prolificId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consented" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Participant_prolificId_key" ON "Participant"("prolificId");
