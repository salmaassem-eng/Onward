"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { changePassword } from "@/app/actions/settings";
import { reportErrors } from "@/lib/notify";
import { validateNewPassword } from "@/lib/settings";
import Button from "@/components/Button";
import FormField from "@/components/FormField";

type Errors = { current?: string; next?: string; confirm?: string };

export default function SecurityCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const found: Errors = {};
    if (!current) found.current = "Enter your current password.";
    const nextError = validateNewPassword(next);
    if (nextError) found.next = nextError;
    else if (next !== confirm) found.confirm = "The passwords don't match.";

    if (Object.keys(found).length > 0) {
      setErrors(found);
      reportErrors(found);
      return;
    }

    setSaving(true);
    try {
      const result = await changePassword(current, next);
      if (!result.ok) {
        if (result.errors) {
          setErrors(result.errors);
          reportErrors(result.errors);
        }
        if (result.message) toast.error(result.message);
        return;
      }

      toast.success("Password changed. Your other devices were signed out.");
      setCurrent("");
      setNext("");
      setConfirm("");
      setErrors({});
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const clear = (key: keyof Errors) => setErrors((prev) => ({ ...prev, [key]: undefined }));

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
      <h2 className="font-heading text-lg font-semibold text-stone-900">Password</h2>
      <p className="mt-1 text-sm text-stone-400">
        Changing it signs you out on your other devices
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-5 space-y-5">
        <FormField
          label="Current password"
          id="current-password"
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => {
            setCurrent(e.target.value);
            clear("current");
          }}
          error={errors.current}
        />
        <FormField
          label="New password"
          id="new-password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={next}
          onChange={(e) => {
            setNext(e.target.value);
            clear("next");
          }}
          error={errors.next}
        />
        <FormField
          label="Confirm new password"
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            clear("confirm");
          }}
          error={errors.confirm}
        />
        <div className="flex justify-end">
          <div className="w-full sm:w-52">
            <Button type="submit" loading={saving}>
              Change password
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}