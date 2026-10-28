"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { deleteAccount } from "@/app/actions/settings";
import { reportErrors } from "@/lib/notify";
import Modal from "@/components/ui/Modal";
import FormField from "@/components/FormField";

export default function DangerZone() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  function close() {
    if (busy) return;
    setOpen(false);
    setPassword("");
    setError(undefined);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!password) {
      const msg = "Enter your password to confirm.";
      setError(msg);
      reportErrors({ password: msg });
      return;
    }

    setBusy(true);
    try {
      const result = await deleteAccount(password);
      if (!result.ok) {
        const msg = result.errors?.password ?? result.message ?? "Couldn't delete the account.";
        setError(result.errors?.password);
        toast.error(msg);
        return;
      }

      toast.success("Your account was deleted.");
      router.replace("/");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="rounded-3xl border border-red-100 bg-red-50 p-6 sm:p-8">
        <h2 className="font-heading font-semibold text-red-700">Danger zone</h2>
        <p className="mt-1 text-sm text-red-600">
          These actions are permanent and cannot be undone.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 font-semibold text-red-600 transition hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" />
          Delete my account
        </button>
      </section>

      <Modal open={open} onClose={close} labelledBy="delete-account-title" width="max-w-md">
        <form onSubmit={onSubmit} noValidate className="p-6">
          <div className="flex items-start justify-between gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 className="h-5 w-5" />
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <h2
            id="delete-account-title"
            className="font-heading mt-4 text-lg font-semibold text-stone-900"
          >
            Delete your account?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-500">
            Your goals, projects, courses, plans and profile will be deleted for good. This
            can&apos;t be undone.
          </p>

          <div className="mt-5">
            <FormField
              label="Confirm with your password"
              id="delete-password"
              type="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(undefined);
              }}
              error={error}
            />
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={close}
              disabled={busy}
              className="flex-1 rounded-xl border border-stone-200 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {busy ? "Deleting..." : "Delete account"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}