"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "react-toastify";
import { logout } from "@/app/actions/auth";
import ConfirmModal from "@/components/ui/ConfirmModal";

type LogoutButtonProps = {
  className?: string;
  label?: string;
  children: React.ReactNode;
};

export default function LogoutButton({
  className,
  label = "Log out",
  children,
}: LogoutButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      await logout();
      toast.success("You're logged out.");
      router.replace("/login");
      router.refresh();
    } catch {
      toast.error("Couldn't log you out. Please try again.");
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={label} className={className}>
        {children}
      </button>

      <ConfirmModal
        open={open}
        tone="neutral"
        icon={LogOut}
        title="Log out of Onward?"
        text="You will need to sign in again to see your goals, projects and courses."
        confirmLabel="Log out"
        loadingLabel="Logging out..."
        loading={busy}
        onConfirm={confirm}
        onClose={() => setOpen(false)}
      />
    </>
  );
}