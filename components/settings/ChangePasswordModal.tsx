"use client";

import { useState } from "react";
import { KeyRound, X } from "lucide-react";
import { toast } from "react-toastify";
import { changePassword } from "@/app/actions/settings";
import { reportErrors } from "@/lib/notify";
import { validateNewPassword } from "@/lib/settings";
import Modal from "@/components/ui/Modal";
import FormField from "@/components/FormField";
import Button from "@/components/Button";

type Errors = { current?: string; next?: string };

type ChangePasswordModalProps = {
  open: boolean;
  hasPassword: boolean;
  onClose: () => void;
};

export default function ChangePasswordModal({ open, hasPassword, onClose }: ChangePasswordModalProps) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="change-password-title" width="max-w-md">
      <Body hasPassword={hasPassword} onClose={onClose} />
    </Modal>
  );
}

function Body({ hasPassword, onClose }: { hasPassword: boolean; onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const found: Errors = {};
    if (hasPassword && !current) found.current = "Enter your current password.";
    const nextError = validateNewPassword(next);
    if (nextError) found.next = nextError;
    else if (hasPassword && next === current) found.next = "Choose a different password.";

    if (Object.keys(found).length > 0) {
      setErrors(found);
      reportErrors(found);
      return;
    }

    setBusy(true);
    try {
      const result = await changePassword(hasPassword ? current : "", next);
      if (!result.ok) {
        if (result.errors) {
          setErrors(result.errors);
          reportErrors(result.errors);
        }
        if (result.message) toast.error(result.message);
        return;
      }

      toast.success(
        hasPassword
          ? "Password changed. Your other devices were signed out."
          : "Password set. You can now sign in with it too."
      );
      onClose();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="overflow-y-auto p-6">
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-green-700">
          <KeyRound className="h-5 w-5" />
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <h2 id="change-password-title" className="font-heading mt-4 text-lg font-semibold text-stone-900">
        {hasPassword ? "Change your password" : "Set a password"}
      </h2>
      <p className="mt-1 text-sm text-stone-500">
        {hasPassword
          ? "You will stay signed in here. Your other devices are signed out."
          : "You sign in with Google now. A password lets you sign in with your email too."}
      </p>

      <div className="mt-5 space-y-5">
        {hasPassword && (
          <FormField
            label="Current password"
            id="current-password"
            type="password"
            autoComplete="current-password"
            autoFocus
            value={current}
            onChange={(e) => {
              setCurrent(e.target.value);
              setErrors((prev) => ({ ...prev, current: undefined }));
            }}
            error={errors.current}
          />
        )}
        <FormField
          label="New password"
          id="new-password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          autoFocus={!hasPassword}
          value={next}
          onChange={(e) => {
            setNext(e.target.value);
            setErrors((prev) => ({ ...prev, next: undefined }));
          }}
          error={errors.next}
        />
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl border border-stone-200 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
        >
          Cancel
        </button>
        <div className="flex-1">
          <Button type="submit" loading={busy}>
            {hasPassword ? "Change password" : "Set password"}
          </Button>
        </div>
      </div>
    </form>
  );
}