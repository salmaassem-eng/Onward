export type Level = 0 | 1 | 2;

const cellStyles = {
  0: "bg-stone-100",
  1: "bg-green-200",
  2: "bg-green-500",
};

type ActivityCardProps = {
  levels: Level[];
  activeDays: number;
  activities: number;
  hours: number;
};

export default function ActivityCard({
  levels,
  activeDays,
  activities,
  hours,
}: ActivityCardProps) {
  const stats = [
    { value: activeDays, label: "active days" },
    { value: activities, label: "activities" },
    { value: `${hours}h`, label: "total" },
  ];

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 lg:h-full">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-stone-900">This month</h2>
        <div className="flex items-center gap-4 text-xs text-stone-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-stone-200" /> None
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-green-200" /> Some
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Active
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1.5">
        {levels.map((level, i) => (
          <div
            key={i}
            className={`aspect-square rounded-md ${cellStyles[level]}`}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border-t border-stone-100 pt-4 text-sm">
        {stats.map((s) => (
          <p key={s.label}>
            <span className="font-semibold text-stone-900">{s.value}</span>{" "}
            <span className="text-stone-400">{s.label}</span>
          </p>
        ))}
      </div>
    </div>
  );
}