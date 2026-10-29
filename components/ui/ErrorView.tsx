"use client";

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import ButtonLink from "@/components/starterPage/Button";
import StatusPage from "./StatusPage";

type ErrorViewProps = {
  error: Error & { digest?: string };
  retry?: () => void;
  homeHref: string;
  homeLabel: string;
  standalone?: boolean;
};

export default function ErrorView({
  error,
  retry,
  homeHref,
  homeLabel,
  standalone = false,
}: ErrorViewProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      icon={TriangleAlert}
      tone="amber"
      standalone={standalone}
      title="Something went wrong"
      text="We couldn't load this page. Your saved goals and progress are not affected. Try again, and if it keeps happening, come back in a little while."
      note={error.digest ? `Error code: ${error.digest}` : undefined}
    >
      <button
        type="button"
        onClick={() => retry?.()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-8 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-green-700 sm:w-auto"
      >
        <RotateCcw className="h-4 w-4" />
        Try again
      </button>
      <ButtonLink href={homeHref} variant="secondary" size="lg" className="w-full sm:w-auto">
        {homeLabel}
      </ButtonLink>
    </StatusPage>
  );
}