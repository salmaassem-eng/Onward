"use client";

import { useState } from "react";
import FormField from "./FormField";
import Button from "./Button";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    // TODO: call the login API here
    console.log({ email, password });
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <FormField
        label="Email address"
        id="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <FormField
        label="Password"
        id="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={error}
      />
      <Button type="submit" loading={isSubmitting}>
        Sign in →
      </Button>
    </form>
  );
}