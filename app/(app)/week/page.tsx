import { addDays, formatWeekRange, isValidDate, shortDate, startOfWeek, weekDates } from "@/lib/dates";
import { getUserGoals } from "@/lib/goal-queries";
import { buildCandidates } from "@/lib/plan";
import { getPlanItems } from "@/lib/plan-queries";
import { getUserProjects } from "@/lib/project-queries";
import { requireUser } from "@/lib/session";
import { getToday } from "@/lib/timezone";
import WeekBoard from "@/components/plan/WeekBoard";

export default async function WeekPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const user = await requireUser();
  const { week } = await searchParams;
  const today = await getToday();

  const start = startOfWeek(week && isValidDate(week) ? week : today);
  const currentStart = startOfWeek(today);
  const days = weekDates(start);

  const [items, goals, projects] = await Promise.all([
    getPlanItems(user.id, days[0], days[6]),
    getUserGoals(user.id),
    getUserProjects(user.id),
  ]);

  const offset = Math.round((Date.parse(start) - Date.parse(currentStart)) / (7 * 86_400_000));
  const title =
    offset === 0 ? "This Week" : offset === -1 ? "Last Week" : offset === 1 ? "Next Week" : `Week of ${shortDate(start)}`;
  const href = (s: string) => (s === currentStart ? "/week" : `/week?week=${s}`);

  return (
    <WeekBoard
      key={start}
      title={title}
      range={formatWeekRange(start)}
      prevHref={href(addDays(start, -7))}
      nextHref={href(addDays(start, 7))}
      todayHref={offset === 0 ? null : "/week"}
      days={days}
      items={items}
      today={today}
      candidates={buildCandidates(goals, projects)}
    />
  );
}