"use client";

import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";

export default function ToastProvider() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setTheme(el.classList.contains("dark") ? "dark" : "light");
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme={theme} />;
}