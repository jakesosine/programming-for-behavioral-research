"use client";

import { useState, useEffect, useRef } from "react";
import { recordResponse, completeTask } from "./actions";

// --- Experimental parameters ---
const BLOCK_SECS = 5;
const MIN_BLOCKS = 3;
const STEADY_THRESHOLD = 0.3;
const PHASE3_BLOCKS = 5;
const FR_R1 = 1;
const FR_R2 = 1;
const CIRCLE_SIZE = 80; // diameter in pixels
const SPEED = 0.5; // pixels per animation frame
// --------------------------------

type Circle = { x: number; y: number; dx: number; dy: number };

function randomVelocity() {
  const angle = Math.random() * 2 * Math.PI;
  return { dx: Math.cos(angle) * SPEED, dy: Math.sin(angle) * SPEED };
}

function isSteadyState(blockRates: number[]): boolean {
  if (blockRates.length < 3) return false;
  const last3 = blockRates.slice(-3);
  const mean = last3.reduce((a, b) => a + b, 0) / 3;
  if (mean === 0) return false;
  return last3.every((r) => Math.abs(r - mean) / mean <= STEADY_THRESHOLD);
}

const CIRCLE_STYLES = [
  "bg-blue-500 hover:bg-blue-400",
  "bg-green-500 hover:bg-green-400",
  "bg-red-400 hover:bg-red-300",
];

export default function TaskPage() {
  const [phase, setPhase] = useState(1);
  const [block, setBlock] = useState(1);
  const [blockSecs, setBlockSecs] = useState(0);
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

  const containerRef = useRef<HTMLDivElement>(null);
  const blockPressesCurrent = useRef(0);
  const phaseBlockRates = useRef<number[]>([]);
  const calledComplete = useRef(false);
  const phase3Blocks = useRef(0);
  const animRef = useRef<number>(0);

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

  // Block timer and phase criterion
  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => {
      const next = blockSecs + 1;
      if (next >= BLOCK_SECS) {
        const rate = (blockPressesCurrent.current / BLOCK_SECS) * 60;
        phaseBlockRates.current = [...phaseBlockRates.current, rate];
        blockPressesCurrent.current = 0;

        if (phase === 3) {
          phase3Blocks.current += 1;
          if (phase3Blocks.current >= PHASE3_BLOCKS) {
            if (!calledComplete.current) {
              calledComplete.current = true;
              setDone(true);
              completeTask();
            }
            return;
          }
        } else if (
          block >= MIN_BLOCKS &&
          isSteadyState(phaseBlockRates.current)
        ) {
          phaseBlockRates.current = [];
          setPhase((p) => p + 1);
          setBlock(1);
          setBlockSecs(0);
          return;
        }

        setBlock((b) => b + 1);
        setBlockSecs(0);
      } else {
        setBlockSecs(next);
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [blockSecs, block, phase, done]);

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
      blockPressesCurrent.current += 1;
    } else if (index === 1 && phase === 2) {
      const next = presses2 + 1;
      setPresses2(next);
      if (next % FR_R2 === 0) {
        reinforced = true;
        setPoints((p) => p + 1);
        setFeedback(true);
        setTimeout(() => setFeedback(false), 400);
      }
      blockPressesCurrent.current += 1;
    }

    await recordResponse(phase, block, button, reinforced);
  }

  const secsLeft = BLOCK_SECS - blockSecs;

  return (
    <div className="flex flex-col flex-1">
      <div className="text-center py-4 shrink-0">
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          Phase {phase} · Block {block} · {secsLeft}s
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
        className="flex-1 relative overflow-hidden mx-4 mb-4 rounded-xl bg-zinc-100 dark:bg-zinc-900"
      >
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
