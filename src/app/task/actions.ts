"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export async function recordResponse(
  phase: number,
  block: number,
  button: string,
  reinforced: boolean
) {
  const cookieStore = await cookies();
  const participantId = cookieStore.get("participantId")?.value;
  if (!participantId) return;

  await prisma.response.create({
    data: { participantId, phase, block, button, reinforced },
  });
}

export async function completeTask() {
  const cookieStore = await cookies();
  const participantId = cookieStore.get("participantId")?.value;
  if (!participantId) redirect("/");

  await prisma.participant.update({
    where: { id: participantId },
    data: { taskCompleted: true },
  });

  redirect("/debrief");
}
