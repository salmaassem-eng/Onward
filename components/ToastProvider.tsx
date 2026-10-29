"use client";

import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";

export default function ToastProvider() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const el = document.documentElement;
    const syncTheme = () => setTheme(el.classList.contains("dark") ? "dark" : "light");
    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });

    const query = window.matchMedia("(min-width: 640px)");
    const syncWidth = () => setWide(query.matches);
    syncWidth();
    query.addEventListener("change", syncWidth);

    return () => {
      observer.disconnect();
      query.removeEventListener("change", syncWidth);
    };
  }, []);

  return (
    <ToastContainer
      position={wide ? "top-right" : "bottom-center"}
      autoClose={3000}
      hideProgressBar
      limit={3}
      theme={theme}
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    />
  );
}