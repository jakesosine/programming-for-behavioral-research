import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

async function agreeToConsent() {
  "use server";

  const cookieStore = await cookies();
  const participantId = cookieStore.get("participantId")?.value;

  if (!participantId) {
    redirect("/");
  }

  await prisma.participant.update({
    where: { id: participantId },
    data: { consented: true },
  });

  redirect("/demographics");
}

async function declineConsent() {
  "use server";

  const cookieStore = await cookies();
  cookieStore.delete("participantId");
  redirect("/");
}

export default async function ConsentPage() {
  const cookieStore = await cookies();
  const participantId = cookieStore.get("participantId")?.value;

  if (!participantId) {
    redirect("/");
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">
        Informed Consent
      </h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
            Introduction
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            This research will ask you to complete a computer-based behavioral
            task in your browser. The purpose of the study is to investigate how
            behavior changes across different conditions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
            Participation
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Taking part in this study is completely voluntary. You may withdraw
            your participation at any time. You are free to stop the task at any
            point. There are no right or wrong responses. All data will remain
            completely anonymous.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
            Risks and Benefits
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Taking part in this study involves no foreseeable risks beyond those
            encountered in typical computer use. The benefit of participating is
            monetary compensation for your time. The broader benefit of this
            study is a better understanding of behavioral patterns in online
            research settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
            Anonymity
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Your name or identity will not be used in any reports or
            presentations of the findings. Your Prolific ID will be used only to
            confirm study completion and process payment. All response data is
            stored on a secure, password-protected database.
          </p>
        </section>

        <section className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
            Electronic Consent
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Continuing with this application indicates that you have read the
            above information, that you are voluntarily agreeing to participate,
            and that you are 18 years of age or older.
          </p>

          <form action={agreeToConsent}>
            <button
              type="submit"
              className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold py-3 px-6 rounded mb-4"
            >
              I Agree to Participate
            </button>
          </form>

          <form action={declineConsent}>
            <button
              type="submit"
              className="w-full border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-semibold py-3 px-6 rounded"
            >
              I Do Not Agree to Participate
            </button>
          </form>
        </section>

        <p className="text-sm text-zinc-500 dark:text-zinc-500 text-center">
          For questions or concerns about this research, please contact the
          research team at [researcher contact information].
        </p>
      </div>
    </div>
  );
}
