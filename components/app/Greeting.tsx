"use client";

import { useEffect, useState } from "react";

export default function Greeting({ name }: { name: string }) {
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(
      hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
    );
  }, []);

  return (
    <h1 className="font-heading text-3xl font-bold text-stone-900 sm:text-4xl">
      {greeting}, {name}
    </h1>
  );
}