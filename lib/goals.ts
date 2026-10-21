export const CATEGORIES = ["Career", "Personal", "Learning", "Health"] as const;
export type Category = (typeof CATEGORIES)[number];

export function formatTargetDate(value: string | null) {
  if (!value) return "";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}