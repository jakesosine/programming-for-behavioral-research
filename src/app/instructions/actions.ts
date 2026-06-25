"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export async function completeInstructions(attempts: number) {
  const cookieStore = await cookies();
  const participantId = cookieStore.get("participantId")?.value;

  if (!participantId) {
    redirect("/");
  }

  await prisma.participant.update({
    where: { id: participantId },
    data: {
      instructionsCompleted: true,
      comprehensionAttempts: attempts,
    },
  });

  redirect("/practice");
}
