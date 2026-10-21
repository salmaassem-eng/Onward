import { desc, eq } from "drizzle-orm";
import { Target } from "lucide-react";
import { db } from "@/db";
import { goals } from "@/db/schema";
import { requireUser } from "@/lib/session";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import GoalForm from "@/components/app/GoalForm";
import GoalCard from "@/components/app/GoalCard";

export default async function GoalsPage() {
  const user = await requireUser();

  const userGoals = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, user.id))
    .orderBy(desc(goals.id));

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
              text="Create your first goal on the right. Drag its progress bar as you move forward."
            />
          ) : (
            userGoals.map((g) => <GoalCard key={g.id} goal={g} />)
          )}
        </section>

        <aside>
          <GoalForm />
        </aside>
      </div>
    </>
  );
}