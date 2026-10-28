type JourneyStatsProps = {
  memberSince: string;
  streak: number;
  total: number;
};

export default function JourneyStats({ memberSince, streak, total }: JourneyStatsProps) {
  const stats = [
    { value: memberSince, label: "Member since" },
    { value: `${streak} ${streak === 1 ? "day" : "days"}`, label: "Current streak" },
    { value: String(total), label: "Total completed" },
  ];

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
      <h2 className="font-heading text-lg font-semibold text-stone-900">Your Journey</h2>
      <p className="mt-1 text-sm text-stone-400">A look at how far you&apos;ve come</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-stone-50 px-4 py-5 text-center">
            <p className="font-heading text-xl font-bold text-stone-900">{s.value}</p>
            <p className="mt-1 text-sm text-stone-400">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}