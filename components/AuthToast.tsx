"use client";

import { useEffect } from "react";
import { toast } from "react-toastify";

const messages: Record<string, string> = {
  google_cancelled: "Google sign-in was cancelled.",
  google_failed: "Google sign-in didn't work. Please try again.",
  google_unverified: "Your Google email isn't verified, so we can't use it.",
  google_not_configured: "Google sign-in isn't set up yet.",
  email_exists: "An account with this email already exists. Sign in with your password.",
  too_many: "Too many attempts. Try again in a few minutes.",
};

export default function AuthToast({ code }: { code?: string }) {
  useEffect(() => {
    if (!code) return;
    toast.error(messages[code] ?? "Something went wrong. Please try again.", {
      toastId: `auth-${code}`,
    });
    // remove ?error=... so a refresh doesn't show it again
    window.history.replaceState(null, "", window.location.pathname);
  }, [code]);

  return null;
}