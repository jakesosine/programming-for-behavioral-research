import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

async function submitDemographics(formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  const participantId = cookieStore.get("participantId")?.value;

  if (!participantId) {
    redirect("/");
  }

  await prisma.demographics.create({
    data: {
      participantId,
      age: parseInt(formData.get("age") as string),
      gender: formData.get("gender") as string,
      education: formData.get("education") as string,
    },
  });

  redirect("/instructions");
}

export default async function DemographicsPage() {
  const cookieStore = await cookies();
  const participantId = cookieStore.get("participantId")?.value;

  if (!participantId) {
    redirect("/");
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
        About You
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8">
        Please answer a few questions before we begin. This information is used
        for research purposes only.
      </p>

      <form action={submitDemographics} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Age
          </label>
          <input
            type="number"
            name="age"
            min="18"
            max="99"
            required
            className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-4 py-3 text-zinc-900 dark:text-white dark:bg-zinc-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Gender
          </label>
          <select
            name="gender"
            required
            className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-4 py-3 text-zinc-900 dark:text-white dark:bg-zinc-900"
          >
            <option value="">Select one</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Highest level of education completed
          </label>
          <select
            name="education"
            required
            className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-4 py-3 text-zinc-900 dark:text-white dark:bg-zinc-900"
          >
            <option value="">Select one</option>
            <option value="High school or equivalent">
              High school or equivalent
            </option>
            <option value="Some college">Some college</option>
            <option value="Bachelor's degree">Bachelor&apos;s degree</option>
            <option value="Graduate degree">Graduate degree</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold py-3 px-6 rounded"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
