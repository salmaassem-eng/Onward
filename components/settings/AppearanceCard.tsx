"use client";

import { useState } from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { toast } from "react-toastify";
import { updateTheme } from "@/app/actions/settings";
import type { Theme } from "@/lib/settings";
import { applyTheme } from "@/components/app/ThemeSync";

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export default function AppearanceCard({ initial }: { initial: Theme }) {
  const [theme, setTheme] = useState<Theme>(initial);

  async function choose(next: Theme) {
    if (next === theme) return;
    const before = theme;

    setTheme(next);
    applyTheme(next); // instant, no waiting for the server

    try {
      const result = await updateTheme(next);
      if (!result.ok) throw new Error();
      toast.success(`${options.find((o) => o.value === next)?.label} theme on.`);
    } catch {
      setTheme(before);
      applyTheme(before);
      toast.error("Couldn't save your theme. Please try again.");
    }
  }

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
      <h2 className="font-heading text-lg font-semibold text-stone-900">Appearance</h2>
      <p className="mt-1 text-sm text-stone-400">Customize how Onward looks</p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {options.map(({ value, label, icon: Icon }) => {
          const active = theme === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => choose(value)}
              className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left transition ${
                active
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-stone-200 text-stone-700 hover:bg-stone-50"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1 font-semibold">{label}</span>
              {active && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}