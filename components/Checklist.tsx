"use client";

import { useEffect, useState } from "react";

const steps = [
  "Set your first goal",
  "Build your journey map",
  "Take one step forward",
];

// how many steps are completed at each frame; the last frames hold, then it loops
const sequence = [0, 1, 2, 2, 2];

export default function Checklist() {
  const [frame, setFrame] = useState(0);
  const done = sequence[frame];

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      setFrame(2); // show the static final state
      return;
    }

    const id = setInterval(() => {
      setFrame((f) => (f + 1) % sequence.length);
    }, 1400);

    return () => clearInterval(id);
  }, []);

  return (
    <ul className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
      {steps.map((label, i) => {
        const isDone = i < done;
        const isActive = i === done;

        return (
          <li key={label} className="flex items-center gap-3">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-500 ${
                isDone
                  ? "border-green-500 bg-green-500"
                  : isActive
                  ? "animate-pulse border-green-400"
                  : "border-stone-600"
              }`}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-all duration-500 ${
                  isDone ? "scale-100 opacity-100" : "scale-0 opacity-0"
                }`}
              >
                <path d="M5 12l5 5L20 7" />
              </svg>
            </span>
            <span
              className={`transition-colors duration-500 ${
                isDone
                  ? "text-green-300"
                  : isActive
                  ? "text-white"
                  : "text-stone-500"
              }`}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}