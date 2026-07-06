"use client";

import { useState, useEffect, useRef } from "react";
import { recordResponse, completeTask } from "./actions";

// --- Experimental parameters ---
const PHASE_MINS = [0.5, 0.5, 0.2]; // minutes per condition (phase 1, 2, 3)
const PHASE_BG_COLORS = ["#e0f2fe", "#fef9c3", "#fce7f3"]; // background color per phase
const FR_R1 = 1;
const FR_R2 = 1;
const CIRCLE_SIZE = 120; // diameter in pixels
const SPEED = 5.5; // pixels per animation frame
// --------------------------------

type Circle = { x: number; y: number; dx: number; dy: number };

function randomVelocity() {
  const angle = Math.random() * 2 * Math.PI;
  return { dx: Math.cos(angle) * SPEED, dy: Math.sin(angle) * SPEED };
}

const CIRCLE_STYLES = [
  "bg-blue-500 hover:bg-blue-400",
  "bg-green-500 hover:bg-green-400",
  "bg-red-400 hover:bg-red-300",
];

export default function TaskPage() {
  const [phase, setPhase] = useState(1);
  const [phaseElapsed, setPhaseElapsed] = useState(0);
  const [points, setPoints] = useState(0);
  const [presses1, setPresses1] = useState(0);
  const [presses2, setPresses2] = useState(0);
  const [feedback, setFeedback] = useState(false);
  const [done, setDone] = useState(false);
  const [circles, setCircles] = useState<Circle[]>(() => [
    { x: 100, y: 100, ...randomVelocity() },
    { x: 300, y: 150, ...randomVelocity() },
    { x: 200, y: 250, ...randomVelocity() },
  ]);

  const [transitionLabel, setTransitionLabel] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const calledComplete = useRef(false);
  const animRef = useRef<number>(0);
  const isFirstPhase = useRef(true);

  // Show overlay on phase change (skip phase 1 start)
  useEffect(() => {
    if (isFirstPhase.current) {
      isFirstPhase.current = false;
      return;
    }
    setTransitionLabel(`Phase ${phase}`);
    const t = setTimeout(() => setTransitionLabel(null), 2000);
    return () => clearTimeout(t);
  }, [phase]);

  // Circle animation loop
  useEffect(() => {
    if (done) return;
    function tick() {
      const el = containerRef.current;
      if (el) {
        const w = el.clientWidth;
        const h = el.clientHeight;
        setCircles((prev) =>
          prev.map((c) => {
            let { x, y, dx, dy } = c;
            x += dx;
            y += dy;
            if (x <= 0 || x >= w - CIRCLE_SIZE) dx = -dx;
            if (y <= 0 || y >= h - CIRCLE_SIZE) dy = -dy;
            x = Math.max(0, Math.min(w - CIRCLE_SIZE, x));
            y = Math.max(0, Math.min(h - CIRCLE_SIZE, y));
            return { x, y, dx, dy };
          })
        );
      }
      animRef.current = requestAnimationFrame(tick);
    }
    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [done]);

  // Phase timer
  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => {
      const next = phaseElapsed + 1;
      const limit = PHASE_MINS[phase - 1] * 60;
      if (next >= limit) {
        if (phase >= PHASE_MINS.length) {
          if (!calledComplete.current) {
            calledComplete.current = true;
            setDone(true);
            completeTask();
          }
          return;
        }
        setPhase((p) => p + 1);
        setPhaseElapsed(0);
      } else {
        setPhaseElapsed(next);
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [phaseElapsed, phase, done]);

  async function handleClick(index: number) {
    if (done) return;

    const labels = ["R1", "R2", "distractor"];
    const button = labels[index];
    let reinforced = false;

    if (index === 0 && phase === 1) {
      const next = presses1 + 1;
      setPresses1(next);
      if (next % FR_R1 === 0) {
        reinforced = true;
        setPoints((p) => p + 1);
        setFeedback(true);
        setTimeout(() => setFeedback(false), 400);
      }
    } else if (index === 1 && phase === 2) {
      const next = presses2 + 1;
      setPresses2(next);
      if (next % FR_R2 === 0) {
        reinforced = true;
        setPoints((p) => p + 1);
        setFeedback(true);
        setTimeout(() => setFeedback(false), 400);
      }
    }

    await recordResponse(phase, button, reinforced);
  }

  const limit = PHASE_MINS[phase - 1] * 60;
  const secsLeft = limit - phaseElapsed;
  const minsLeft = Math.floor(secsLeft / 60);
  const secsPart = secsLeft % 60;

  return (
    <div className="flex flex-col flex-1">
      <div className="text-center py-4 shrink-0">
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          Phase {phase} · {minsLeft}:{secsPart.toString().padStart(2, "0")}
        </p>
        <p className="text-4xl font-bold text-zinc-900 dark:text-white">
          {points}
          {feedback && <span className="text-green-500 text-xl ml-3">+1</span>}
        </p>
        <p className="text-zinc-400 dark:text-zinc-500 text-sm">points</p>
        {done && (
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2">
            Task complete. Loading next section…
          </p>
        )}
      </div>

      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden mx-4 mb-4 rounded-xl"
        style={{
          backgroundColor: PHASE_BG_COLORS[phase - 1],
          transition: "background-color 0.8s ease",
        }}
      >
        {transitionLabel && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="bg-black/50 text-white text-3xl font-bold px-10 py-5 rounded-2xl">
              {transitionLabel}
            </div>
          </div>
        )}
        {circles.map((c, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={done}
            style={{
              position: "absolute",
              left: c.x,
              top: c.y,
              width: CIRCLE_SIZE,
              height: CIRCLE_SIZE,
            }}
            className={`rounded-full transition-colors disabled:cursor-not-allowed ${CIRCLE_STYLES[i]}`}
          />
        ))}
      </div>
    </div>
  );
}
