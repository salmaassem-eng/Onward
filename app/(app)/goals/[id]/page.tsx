import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { goals } from "@/db/schema";
import { requireUser } from "@/lib/session";
import PageHeader from "@/components/app/PageHeader";
import GoalForm from "@/components/app/Goals/GoalForm";

export default async function EditGoalPage({
  params,  // has to be waited
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const goalId = Number(id);
  if (!Number.isInteger(goalId)) notFound();

  const goal = await db.query.goals.findFirst({
    where: and(eq(goals.id, goalId), eq(goals.userId, user.id)),
    with: { steps: { orderBy: (s, { asc }) => [asc(s.position)] } },
  });
  if (!goal) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/goals" className="text-sm text-stone-500 hover:text-stone-900">
        ← Back to goals
      </Link>
      <div className="mb-8 mt-4">
        <PageHeader
          title="Edit goal"
          subtitle="Change the details, or add, remove and reorder steps."
        />
      </div>
      <GoalForm
        goalId={goal.id}
        initial={{
          title: goal.title,
          category: goal.category,
          description: goal.description ?? "",
          targetDate: goal.targetDate ?? "",
          steps: goal.steps.map((s) => ({
            id: s.id,
            title: s.title,
            completed: s.completed,
          })),
        }}
      />
    </div>
  );
}