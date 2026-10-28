"use client";

import { useEffect } from "react";
import type { Theme } from "@/lib/settings";

export function applyTheme(theme: Theme) {
  document.cookie = `theme=${theme}; path=/; max-age=31536000; samesite=lax`;
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export default function ThemeSync({ theme }: { theme: Theme }) {
  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;

    // follow the operating system while "System" is selected
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [theme]);

  return null;
}