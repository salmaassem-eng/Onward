"use client";

import ErrorView from "@/components/ui/ErrorView";

export default function AppError({
  error,
  unstable_retry,
  reset,
}: {
  error: Error & { digest?: string };
  unstable_retry?: () => void;
  reset?: () => void;
}) {
  return (
    <ErrorView
      error={error}
      retry={unstable_retry ?? reset}
      homeHref="/dashboard"
      homeLabel="Back to Home"
    />
  );
}