export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-white dark:bg-black px-6">
      <div className="flex flex-col items-center text-center gap-4 max-w-lg">
        <p className="text-5xl">🎉</p>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Nice work! You&apos;re up and running!
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg">
          Throughout this course we&apos;ll be building the{" "}
          <span className="font-semibold text-zinc-700 dark:text-zinc-200">
            Resurgence Experiment
          </span>{" "}
          from scratch. By the end you&apos;ll have a fully working behavioral
          study running in the browser.
        </p>
        <p className="text-sm text-zinc-400 dark:text-zinc-600 mt-2">
          Let&apos;s get to work.
        </p>
      </div>
    </div>
  );
}
