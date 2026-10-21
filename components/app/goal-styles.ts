import type { Category } from "@/lib/goals";

export const categoryStyles: Record<Category, { badge: string; bar: string }> = {
  Career: { badge: "bg-green-50 text-green-700", bar: "bg-green-500" },
  Personal: { badge: "bg-violet-50 text-violet-700", bar: "bg-violet-400" },
  Learning: { badge: "bg-sky-50 text-sky-700", bar: "bg-sky-500" },
  Health: { badge: "bg-amber-50 text-amber-700", bar: "bg-amber-500" },
};