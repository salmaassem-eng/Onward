import { Compass } from "lucide-react";
import { getUserGoals } from "@/lib/goal-queries";
import { requireUser } from "@/lib/session";
import EmptyState from "@/components/app/EmptyState";
import GoalList from "@/components/journey/GoalList";
import GoalHero from "@/components/journey/GoalHero";
import JourneyPath from "@/components/journey/JourneyPath";

export default async function JourneyPage({
  searchParams,
}: {
  searchParams: Promise<{ goal?: string }>;
}) {
  const user = await requireUser();
  const { goal: goalParam } = await searchParams;
  const goals = await getUserGoals(user.id);

  const selected =
    goals.find((g) => String(g.id) === goalParam) ??
    goals.find((g) => g.progress < 100) ??
    goals[0];

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-widest text-green-700">
        Goals and journey
      </p>
      <h1 className="font-heading mt-3 max-w-2xl text-3xl font-bold leading-tight text-stone-900 sm:text-4xl">
        Choose where you&apos;re going. See only what&apos;s next.
      </h1>
      <p className="mt-3 text-lg text-stone-500">
        Your goals, steps and next actions live together in one quiet view.
      </p>

      <div className="mt-10">
        {!selected ? (
          <EmptyState
            icon={Compass}
            title="Your map is empty"
            text="Create a goal and break it into steps. Your journey builds itself from them."
            action={{ href: "/goals/new", label: "Create a goal" }}
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
            <GoalList goals={goals} selectedId={selected.id} />
            <div className="min-w-0">
              <GoalHero goal={selected} />
              <JourneyPath
                key={selected.id}
                goalId={selected.id}
                goalTitle={selected.title}
                steps={selected.steps}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}