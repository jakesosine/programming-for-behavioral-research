import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

async function submitId(formData: FormData) {
  "use server";

  const prolificId = formData.get("prolificId") as string;

  if (!prolificId || prolificId.trim() === "") {
    return;
  }

  const existing = await prisma.participant.findUnique({
    where: { prolificId: prolificId.trim() },
  });

  if (existing) {
    redirect("/already-completed");
  }

  const participant = await prisma.participant.create({
    data: { prolificId: prolificId.trim() },
  });

  (await cookies()).set("participantId", participant.id, {
    httpOnly: true,
    path: "/",
  });

  redirect("/consent");
}

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-white dark:bg-black px-6">
      <div className="flex flex-col items-center text-center gap-6 max-w-lg">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Welcome
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg">
          Please enter your Prolific ID to begin.
        </p>
        <form action={submitId} className="flex flex-col gap-4 w-full">
          <input
            type="text"
            name="prolificId"
            placeholder="Your Prolific ID"
            className="border border-zinc-300 dark:border-zinc-700 rounded px-4 py-3 text-zinc-900 dark:text-white dark:bg-zinc-900 w-full"
          />
          <button
            type="submit"
            className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold px-6 py-3 rounded"
          >
            Begin
          </button>
        </form>
      </div>
    </div>
  );
}
