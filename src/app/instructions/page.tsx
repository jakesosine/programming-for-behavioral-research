"use client";

import { useState } from "react";
import { completeInstructions } from "./actions";

const steps = [
  {
    title: "Welcome to the Study",
    body: "In this study you will press a button on screen. Each press may earn you points. Points represent a bonus payment added to your base compensation.",
  },
  {
    title: "How Points Work",
    body: "Not every button press will earn a point. You may need to press several times before earning one. Keep pressing at whatever pace feels natural to you.",
  },
  {
    title: "The Rules May Change",
    body: "The study has multiple phases. The rules about how points are earned may change between phases. You will not be told when a change happens. Just continue pressing the button throughout.",
  },
  {
    title: "Duration",
    body: "The study takes approximately 20 minutes. Please complete it in one sitting without interruption. Do not close the browser tab or navigate away during the task.",
  },
];

const questions = [
  {
    question: "What happens when you press the button?",
    options: [
      "You always earn a point",
      "You may earn a point",
      "Nothing happens",
      "The study ends",
    ],
    correct: 1,
  },
  {
    question: "Will the rules stay the same for the entire study?",
    options: [
      "Yes, the rules never change",
      "No, the rules may change between phases",
      "Only if you press fast enough",
      "The instructions did not say",
    ],
    correct: 1,
  },
];

export default function InstructionsPage() {
  const [step, setStep] = useState(0);
  const [showCheck, setShowCheck] = useState(false);
  const [answers, setAnswers] = useState<number[]>(
    Array(questions.length).fill(-1)
  );
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const allCorrect = questions.every((q, i) => answers[i] === q.correct);

  async function handleCheckSubmit() {
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setSubmitted(true);

    if (allCorrect) {
      await completeInstructions(nextAttempts);
    }
  }

  if (showCheck) {
    return (
      <div className="max-w-xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          Comprehension Check
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">
          Please answer the following questions before starting.
        </p>

        <div className="space-y-8">
          {questions.map((q, qi) => (
            <div key={qi}>
              <p className="font-medium text-zinc-800 dark:text-zinc-200 mb-3">
                {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const selected = answers[qi] === oi;
                  const isCorrect = oi === q.correct;
                  let style =
                    "w-full text-left px-4 py-3 rounded border text-sm ";
                  if (!submitted) {
                    style += selected
                      ? "border-zinc-900 dark:border-white bg-zinc-100 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-white"
                      : "border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300";
                  } else {
                    if (isCorrect)
                      style +=
                        "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300";
                    else if (selected)
                      style +=
                        "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300";
                    else
                      style +=
                        "border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600";
                  }
                  return (
                    <button
                      key={oi}
                      className={style}
                      onClick={() => {
                        if (submitted) return;
                        const next = [...answers];
                        next[qi] = oi;
                        setAnswers(next);
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {submitted && !allCorrect && (
          <div className="mt-8">
            <p className="text-red-600 dark:text-red-400 text-sm mb-4">
              One or more answers were incorrect. Please review the instructions
              and try again.
            </p>
            <button
              className="w-full border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium py-3 rounded mb-3"
              onClick={() => {
                setStep(0);
                setShowCheck(false);
                setAnswers(Array(questions.length).fill(-1));
                setSubmitted(false);
              }}
            >
              Review Instructions
            </button>
          </div>
        )}

        {!submitted && (
          <button
            className="w-full mt-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold py-3 px-6 rounded disabled:opacity-40"
            disabled={answers.some((a) => a === -1)}
            onClick={handleCheckSubmit}
          >
            Submit Answers
          </button>
        )}
      </div>
    );
  }

  const current = steps[step];

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-6">
        Step {step + 1} of {steps.length}
      </p>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
        {current.title}
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed mb-12">
        {current.body}
      </p>

      <div className="flex gap-3">
        {step > 0 && (
          <button
            className="flex-1 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium py-3 rounded"
            onClick={() => setStep(step - 1)}
          >
            Back
          </button>
        )}
        <button
          className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold py-3 rounded"
          onClick={() => {
            if (step < steps.length - 1) {
              setStep(step + 1);
            } else {
              setShowCheck(true);
            }
          }}
        >
          {step < steps.length - 1 ? "Next" : "Continue to Check"}
        </button>
      </div>
    </div>
  );
}
