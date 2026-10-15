"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import FormField from "./FormField";
import Button from "./Button";
import { validateLogin, type LoginErrors } from "@/lib/validation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationErrors = validateLogin({ email, password });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: call the login API here.
      // On failure, show: toast.error("Wrong email or password");
      console.log({ email, password });
      toast.info("Form is valid. Backend comes next.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
      <FormField
        label="Email address"
        id="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setErrors((prev) => ({ ...prev, email: undefined }));
        }}
        error={errors.email}
      />
      <FormField
        label="Password"
        id="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setErrors((prev) => ({ ...prev, password: undefined }));
        }}
        error={errors.password}
      />
      <Button type="submit" loading={isSubmitting}>
        Sign in →
      </Button>
    </form>
  );
}