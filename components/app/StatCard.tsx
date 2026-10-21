type Tone = "green" | "white" | "violet";

const tones = {
  green: {
    card: "border-green-100 bg-green-50",
    value: "text-green-700",
    label: "text-green-700",
    hint: "text-green-500",
  },
  white: {
    card: "border-stone-200 bg-white",
    value: "text-stone-900",
    label: "text-stone-600",
    hint: "text-stone-400",
  },
  violet: {
    card: "border-violet-100 bg-violet-50",
    value: "text-violet-600",
    label: "text-violet-600",
    hint: "text-violet-400",
  },
};

type StatCardProps = {
  value: string | number;
  label: string;
  hint: string;
  tone?: Tone;
};

export default function StatCard({
  value,
  label,
  hint,
  tone = "white",
}: StatCardProps) {
  const t = tones[tone];
  return (
    <div className={`rounded-2xl border p-5 ${t.card}`}>
      <p className={`font-heading text-3xl font-bold ${t.value}`}>{value}</p>
      <p className={`mt-1 text-sm font-medium ${t.label}`}>{label}</p>
      <p className={`mt-1 text-xs ${t.hint}`}>{hint}</p>
    </div>
  );
}