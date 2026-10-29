"use client";

export default function GlobalError({
  error,
  unstable_retry,
  reset,
}: {
  error: Error & { digest?: string };
  unstable_retry?: () => void;
  reset?: () => void;
}) {
  const retry = unstable_retry ?? reset;

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          textAlign: "center",
          background: "#f8f8f4",
          color: "#1c1917",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ fontSize: 28, margin: "0 0 12px" }}>Something went wrong</h1>
          <p style={{ color: "#78716c", lineHeight: 1.6, margin: "0 0 24px" }}>
            Onward ran into a problem and couldn&apos;t load. Please try again.
          </p>
          <button
            type="button"
            onClick={() => retry?.()}
            style={{
              background: "#16a34a",
              color: "#ffffff",
              border: 0,
              borderRadius: 12,
              padding: "14px 28px",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p style={{ marginTop: 24, fontSize: 12, color: "#a8a29e" }}>
              Error code: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}