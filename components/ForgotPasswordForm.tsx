"use client";

import { useState } from "react";
import { MailCheck } from "lucide-react";
import { toast } from "react-toastify";
import { requestPasswordReset } from "@/app/actions/password-reset";
import { reportErrors } from "@/lib/notify";
import Button from "./Button";
import FormField from "./FormField";

export default function ForgotPasswordForm({ minutes }: { minutes: number }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const value = email.trim();
    const found = !value
      ? "Please enter your email."
      : !/^\S+@\S+\.\S+$/.test(value)
      ? "Please enter a valid email address."
      : undefined;

    if (found) {
      setError(found);
      reportErrors({ email: found });
      return;
    }

    setBusy(true);
    try {
      const result = await requestPasswordReset(value);

      if (!result.ok) {
        if (result.error) {
          setError(result.error);
          reportErrors({ email: result.error });
        }
        if (result.message) toast.error(result.message);
        return;
      }

      toast.success("If that email has an account, a reset link is on its way.");
      setSentTo(value);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (sentTo) {
    return (
      <div role="status" className="mt-8 rounded-2xl border border-green-100 bg-green-50 p-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-700">
          <MailCheck className="h-5 w-5" />
        </span>
        <h3 className="font-heading mt-4 text-lg font-semibold text-stone-900">
          Check your email
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          If <span className="font-semibold break-all">{sentTo}</span> has an account, we sent a
          link to it. It works once and expires in {minutes} minutes. If you don&apos;t see it,
          check your spam folder.
        </p>
        <button
          type="button"
          onClick={() => {
            setSentTo(null);
            setEmail("");
          }}
          className="mt-4 text-sm font-semibold text-green-700 hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
      <FormField
        label="Email address"
        id="forgot-email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError(undefined);
        }}
        error={error}
      />
      <Button type="submit" loading={busy}>
        Send reset link →
      </Button>
    </form>
  );
}