import Link from "next/link";
import { CalendarCheck, Target } from "lucide-react";
import { requireUser } from "@/lib/session";
import Greeting from "@/components/app/Greeting";
import ActivityCard, { type Level } from "@/components/app/ActivityCard";
import StatCard from "@/components/app/StatCard";
import ContinueCard from "@/components/app/ContinueCard";
import EmptyState from "@/components/app/EmptyState";
import GoalSummary from "@/components/app/Goals/GoalSummary";
import { getUserGoals } from "@/lib/goal-queries";

export default async function DashboardPage() {
  const user = await requireUser();
  const firstName = user.name.split(" ")[0];

  const userGoals = await getUserGoals(user.id);
  const focusGoal = userGoals
    .filter((g) => g.nextAction)
    .sort((a, b) => b.progress - a.progress)[0];

  const stats = {
    activeGoals: userGoals.filter((g) => g.progress < 100).length,
    completedGoals: userGoals.filter((g) => g.progress === 100).length,
    // these need a tasks/activity table, which comes next
    streak: 0,
    tasksDone: 0,
    tasksTotal: 0,
    activeDays: 0,
    activities: 0,
    hours: 0,
  };
  const monthLevels: Level[] = Array(28).fill(0);
  const areas = new Set(userGoals.map((g) => g.category)).size;

  return (
    <div className="space-y-8">
      <div>
        <Greeting name={firstName} />
        <p className="mt-2 text-lg text-stone-500">
          {userGoals.length === 0
            ? "Welcome to Onward. Set your first goal and your journey begins."
            : "You've already started. That's the hardest part."}
        </p>
      </div>

      <div className="grid items-stretch gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 lg:h-full">
          <ActivityCard
            levels={monthLevels}
            activeDays={stats.activeDays}
            activities={stats.activities}
            hours={stats.hours}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:col-span-2 lg:h-full lg:grid-rows-2">
          <StatCard
            tone="green"
            value={stats.streak}
            label="Day streak"
            hint="Start today →"
          />
          <StatCard
            value={`${stats.tasksDone}/${stats.tasksTotal}`}
            label="Tasks today"
            hint="Nothing planned"
          />
          <StatCard
            value={stats.activeGoals}
            label="Active goals"
            hint={areas > 0 ? `Across ${areas} ${areas === 1 ? "area" : "areas"}` : "Add your first goal"}
          />
          <StatCard
            tone="violet"
            value={stats.completedGoals}
            label="Goals done"
            hint="Since you started"
          />
        </div>
      </div>

      <ContinueCard goal={focusGoal} />

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-heading text-lg font-semibold text-stone-900">
              Your Goals
            </h2>
            {userGoals.length > 0 && (
              <Link
                href="/goals"
                className="text-sm font-semibold text-green-600 hover:underline"
              >
                View all →
              </Link>
            )}
          </div>

          {userGoals.length === 0 ? (
            <EmptyState
              icon={Target}
              title="No goals yet"
              text="Create your first goal and Onward will start building your journey map."
              action={{ href: "/goals", label: "Create a goal" }}
            />
          ) : (
            <div className="space-y-4">
              {userGoals.slice(0, 3).map((g) => (
                <GoalSummary key={g.id} goal={g} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-heading text-lg font-semibold text-stone-900">
              Today
            </h2>
            <span className="text-sm text-stone-400">
              {stats.tasksDone} of {stats.tasksTotal}
            </span>
          </div>
          <EmptyState
            icon={CalendarCheck}
            title="Nothing planned"
            text="Tasks you plan for today will appear here."
          />
        </section>
      </div>
    </div>
  );
}