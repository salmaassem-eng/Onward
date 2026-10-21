import { Target } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getGoalsForUser } from "@/lib/goals-data";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import GoalForm from "@/components/app/Goals/GoalForm";
import GoalsFilter from "@/components/app/Goals/GoalsFilter";

export default async function GoalsPage() {
  const user = await requireUser();

  const userGoals = await getGoalsForUser(user.id);

  return (
    <>
      <PageHeader
        title="Goals"
        subtitle="Everything you want to achieve, in one place."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <section className="space-y-4">
          {userGoals.length === 0 ? (
            <EmptyState
              icon={Target}
              title="No goals yet"
              text="Create your first goal on the right and break it into actionable steps."
            />
          ) : (
            <GoalsFilter goals={userGoals} />
          )}
        </section>

        <aside>
          <GoalForm />
        </aside>
      </div>
    </>
  );
}