import { shortDate } from "@/lib/dates";
import type { ActivityDay } from "@/lib/activity";

function level(count: number) {
  return count === 0 ? 0 : count <= 2 ? 1 : 2;
}

const cellStyles = ["bg-stone-100", "bg-green-200", "bg-green-500"];

type ActivityCardProps = {
  days: ActivityDay[];
  activeDays: number;
  activities: number;
  longestStreak: number;
};

export default function ActivityCard({ days, activeDays, activities, longestStreak }: ActivityCardProps) {
  const stats = [
    { value: activeDays, label: "active days" },
    { value: activities, label: "activities" },
    { value: `${longestStreak}d`, label: "best streak" },
  ];

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-stone-900">Last 28 days</h2>
        <div className="flex items-center gap-4 text-xs text-stone-400">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-stone-200" /> None</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-green-200" /> Some</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Active</span>
        </div>
      </div>

      <div
        role="img"
        aria-label={`${activities} activities on ${activeDays} days in the last 28 days`}
        className="mt-5 grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1.5"
      >
        {days.map((d) => (
          <div
            key={d.date}
            title={`${shortDate(d.date)}: ${d.count} ${d.count === 1 ? "activity" : "activities"}`}
            className={`aspect-square rounded-md ${cellStyles[level(d.count)]}`}
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