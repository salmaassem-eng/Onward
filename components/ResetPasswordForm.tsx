"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { resetPasswordWithToken } from "@/app/actions/password-reset";
import { reportErrors } from "@/lib/notify";
import { validateNewPassword } from "@/lib/settings";
import Button from "./Button";
import FormField from "./FormField";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [expired, setExpired] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const found = validateNewPassword(password);
    if (found) {
      setError(found);
      reportErrors({ password: found });
      return;
    }

    setBusy(true);
    try {
      const result = await resetPasswordWithToken(token, password);

      if (!result.ok) {
        if (result.error) {
          setError(result.error);
          reportErrors({ password: result.error });
        }
        if (result.message) toast.error(result.message);
        if (result.expired) setExpired(true);
        return;
      }

      toast.success("Password changed. Sign in with your new password.");
      router.push("/login");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
      <FormField
        label="New password"
        id="reset-new-password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        autoFocus
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setError(undefined);
        }}
        error={error}
      />

      {expired && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          This link has expired.{" "}
          <Link href="/forgot-password" className="font-semibold underline">
            Get a new one
          </Link>
        </p>
      )}

      <Button type="submit" loading={busy}>
        Change password →
      </Button>
    </form>
  );
}