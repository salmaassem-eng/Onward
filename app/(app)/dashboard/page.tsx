import Link from "next/link";
import { Target } from "lucide-react";
import { getActivitySummary } from "@/lib/activity-queries";
import { getUserGoals } from "@/lib/goal-queries";
import { buildCandidates } from "@/lib/plan";
import { getPlanItems } from "@/lib/plan-queries";
import { getUserProjects } from "@/lib/project-queries";
import { requireUser } from "@/lib/session";
import { getToday } from "@/lib/timezone";
import Greeting from "@/components/app/Greeting";
import ActivityCard from "@/components/app/ActivityCard";
import StatCard from "@/components/app/StatCard";
import ContinueCard from "@/components/app/ContinueCard";
import EmptyState from "@/components/app/EmptyState";
import GoalSummary from "@/components/app/Goals/GoalSummary";
import TodayCard from "@/components/plan/TodayCard";
import { getUserCourses } from "@/lib/course-queries";

export default async function DashboardPage() {
  const user = await requireUser();
  const today = await getToday();

  const [goals, projects, courses, todayItems, activity] = await Promise.all([
    getUserGoals(user.id),
    getUserProjects(user.id),
    getUserCourses(user.id),
    getPlanItems(user.id, today, today),
    getActivitySummary(user.id),
  ]);

  const firstName = user.name.split(" ")[0];
  const doneToday = todayItems.filter((i) => i.completed).length;
  const remainingToday = todayItems.length - doneToday;
  const activeGoals = goals.filter((g) => g.progress < 100).length;
  const areas = new Set(goals.map((g) => g.category)).size;

  const intro =
    goals.length === 0
      ? "Welcome to Onward. Set your first goal and your journey begins."
      : activity.doneToday
        ? "You moved forward today. That's what counts."
        : "One small step today keeps your streak alive.";

  const streakHint = activity.doneToday
    ? "Keep it going →"
    : activity.streak > 0
      ? "Do one thing today to keep it"
      : "Finish one step to start";

  return (
    <div className="space-y-8">
      <div>
        <Greeting name={firstName} />
        <p className="mt-2 text-lg text-stone-500">{intro}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ActivityCard
            days={activity.days}
            activeDays={activity.activeDays}
            activities={activity.activities}
            longestStreak={activity.longestStreak}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          <StatCard tone="green" value={activity.streak} label="Day streak" hint={streakHint} />
          <StatCard
            value={`${doneToday}/${todayItems.length}`}
            label="Tasks today"
            hint={todayItems.length === 0 ? "Nothing planned" : `${remainingToday} remaining`}
          />
          <StatCard
            value={activeGoals}
            label="Active goals"
            hint={areas > 0 ? `Across ${areas} ${areas === 1 ? "area" : "areas"}` : "Add your first goal"}
          />
          <StatCard tone="violet" value={activity.total} label="Total done" hint="Steps and tasks finished" />
        </div>
      </div>

      <ContinueCard goals={goals} />

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-heading text-lg font-semibold text-stone-900">Your Goals</h2>
            {goals.length > 0 && (
              <Link href="/journey" className="text-sm font-semibold text-green-600 hover:underline">
                View all →
              </Link>
            )}
          </div>

          {goals.length === 0 ? (
            <EmptyState
              icon={Target}
              title="No goals yet"
              text="Create your first goal and Onward will start building your journey map."
              action={{ href: "/goals/new", label: "Create a goal" }}
            />
          ) : (
            <div className="space-y-4">
              {goals.slice(0, 3).map((g) => (
                <GoalSummary key={g.id} goal={g} />
              ))}
            </div>
          )}
        </section>

        <TodayCard items={todayItems} today={today} candidates={buildCandidates(goals, projects, courses)} />
      </div>
    </div>
  );
}