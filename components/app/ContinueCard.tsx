import Button from "@/components/starterPage/Button";
import type { GoalView } from "@/lib/goals";

export default function ContinueCard({ goal }: { goal?: GoalView }) {
  const action = goal?.nextAction;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#1c1917] p-8 sm:p-10">
      <div className="pointer-events-none absolute -right-10 -top-10 h-80 w-80 bg-[radial-gradient(circle,rgba(34,197,94,0.15),transparent_70%)]" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        {goal && action ? (
          <>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-green-400">
                Continue your journey
              </p>
              <h2 className="font-heading mt-3 text-3xl font-bold text-white">
                {action.title}
              </h2>
              <p className="mt-2 text-stone-400">
                {action.kind === "substep"
                  ? `${goal.title} · ${action.parent}`
                  : goal.title}
              </p>
              <div className="mt-5 flex items-center gap-4">
                <div className="h-2 flex-1 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-green-400"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-green-400">
                  {goal.progress}%
                </span>
              </div>
            </div>
            <Button href={`/journey?goal=${goal.id}`} size="lg">
              Continue →
            </Button>
          </>
        ) : (
          <>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-green-400">
                Start here
              </p>
              <h2 className="font-heading mt-3 text-3xl font-bold text-white">
                Nothing to continue yet
              </h2>
              <p className="mt-2 max-w-md text-stone-400">
                Add a goal and it will show up here, so you can jump back in
                any time.
              </p>
            </div>
            <Button href="/goals/new" size="lg">
              Set your first goal →
            </Button>
          </>
        )}
      </div>
    </section>
  );
}