const styles: Record<string, string> = {
  Career: "bg-green-50 text-green-700",
  Learning: "bg-sky-50 text-sky-700",
  Health: "bg-amber-50 text-amber-700",
  Personal: "bg-violet-50 text-violet-700",
  Project: "bg-teal-50 text-teal-700",
};

export const tagStyle = (tag: string) => styles[tag] ?? "bg-stone-100 text-stone-600";