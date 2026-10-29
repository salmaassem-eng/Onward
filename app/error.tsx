"use client";

import ErrorView from "@/components/ui/ErrorView";

export default function RootError({
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
      standalone
      error={error}
      retry={unstable_retry ?? reset}
      homeHref="/"
      homeLabel="Go home"
    />
  );
}