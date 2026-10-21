import type { LucideIcon } from "lucide-react";
import Button from "@/components/starterPage/Button";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  text: string;
  action?: { href: string; label: string };
};

export default function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="font-heading mt-5 text-lg font-semibold text-stone-900">
        {title}
      </h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-stone-500">
        {text}
      </p>
      {action && (
        <div className="mt-6">
          <Button href={action.href}>{action.label}</Button>
        </div>
      )}
    </div>
  );
}