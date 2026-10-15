"use client";

import { useState } from "react";
import FormField from "./FormField";
import Button from "./Button";

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    // TODO: call the signup API here
    console.log({ name, email, password });
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <FormField
        label="Your name"
        id="name"
        type="text"
        autoComplete="name"
        placeholder="Salma"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
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
        autoComplete="new-password"
        placeholder="At least 8 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={error}
      />
      <Button type="submit" loading={isSubmitting}>
        Get started →
      </Button>
    </form>
  );
}