import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function DebriefPage() {
  const cookieStore = await cookies();
  const participantId = cookieStore.get("participantId")?.value;

  if (!participantId) {
    redirect("/");
  }

  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
  });

  if (!participant?.taskCompleted) {
    redirect("/task");
  }

  const completionUrl =
    process.env.PROLIFIC_COMPLETION_URL ?? "https://app.prolific.com";

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">
        Thank You
      </h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
            What This Study Was About
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            This study examined a phenomenon called resurgence: the reappearance
            of a previously reinforced behavior when a more recently reinforced
            alternative is discontinued. During the task, clicking one circle
            earned points in the first phase. In the second phase, a different
            circle earned points. In the final phase, no circles earned points.
            We were interested in whether clicking returned to the first circle
            during the final phase.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
            Why We Did Not Explain the Phases
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            We withheld information about the phase structure because explicitly
            telling participants when conditions would change can cause behavior
            to be driven by verbal rules rather than direct experience with the
            task. This would make it harder to study how behavior responds
            naturally to changes in reinforcement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
            Questions or Concerns
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            If you have any questions about this study, please contact the
            research team at [researcher contact information].
          </p>
        </section>

        <a
          href={completionUrl}
          className="block w-full text-center bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold py-4 px-6 rounded-lg text-lg"
        >
          Return to Prolific
        </a>
      </div>
    </div>
  );
}
