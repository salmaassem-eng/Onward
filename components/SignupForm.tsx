"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import FormField from "./FormField";
import Button from "./Button";
import { validateSignup, type SignupErrors } from "@/lib/validation";

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<SignupErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationErrors = validateSignup({ name, email, password });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: call the signup API here.
      // On "email already used": toast.error("This email is already registered");
      // On success: toast.success("Account created!") then redirect.
      console.log({ name, email, password });
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
        label="Your name"
        id="name"
        type="text"
        autoComplete="name"
        placeholder="Salma"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setErrors((prev) => ({ ...prev, name: undefined }));
        }}
        error={errors.name}
      />
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
        autoComplete="new-password"
        placeholder="At least 8 characters"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setErrors((prev) => ({ ...prev, password: undefined }));
        }}
        error={errors.password}
      />
      <Button type="submit" loading={isSubmitting}>
        Get started →
      </Button>
    </form>
  );
}