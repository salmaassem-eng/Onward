import type { LucideIcon } from "lucide-react";
import Logo from "@/components/Logo";

type StatusPageProps = {
  icon: LucideIcon;
  code?: string;
  title: string;
  text: string;
  note?: string;
  tone?: "green" | "amber";
  standalone?: boolean; // true = full screen with the logo, outside the app layout
  children?: React.ReactNode;
};

const tones = {
  green: "bg-green-50 text-green-700",
  amber: "bg-amber-50 text-amber-700",
};

export default function StatusPage({
  icon: Icon,
  code,
  title,
  text,
  note,
  tone = "green",
  standalone = false,
  children,
}: StatusPageProps) {
  const body = (
    <div className="mx-auto flex max-w-md flex-col items-center text-center">
      <span className={`flex h-16 w-16 items-center justify-center rounded-2xl ${tones[tone]}`}>
        <Icon className="h-8 w-8" />
      </span>

      {code && (
        <p className="font-heading mt-6 text-sm font-semibold uppercase tracking-widest text-stone-400">
          {code}
        </p>
      )}
      <h1 className="font-heading mt-2 text-3xl font-bold text-stone-900 sm:text-4xl">{title}</h1>
      <p className="mt-3 leading-relaxed text-stone-500">{text}</p>

      {children && (
        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">{children}</div>
      )}
      {note && <p className="mt-6 text-xs text-stone-400">{note}</p>}
    </div>
  );

  if (!standalone) return <div className="py-12 sm:py-20">{body}</div>;

  return (
    <div className="flex min-h-dvh flex-col bg-[#f8f8f4] px-6 py-6">
      <header>
        <Logo variant="onLight" size="md" />
      </header>
      <main className="flex flex-1 items-center justify-center py-10">{body}</main>
    </div>
  );
}