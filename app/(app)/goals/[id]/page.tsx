import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserGoalForEdit } from "@/lib/goal-queries";
import { requireUser } from "@/lib/session";
import PageHeader from "@/components/app/PageHeader";
import GoalForm from "@/components/app/Goals/GoalForm";

export default async function EditGoalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const goalId = Number(id);
  if (!Number.isInteger(goalId)) notFound();

  const goal = await getUserGoalForEdit(user.id, goalId);
  if (!goal) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/journey" className="text-sm text-stone-500 hover:text-stone-900">
        ← Back to journey
      </Link>
      <div className="mb-8 mt-4">
        <PageHeader
          title="Edit goal"
          subtitle="Change the details, or add, remove and reorder steps and sub-steps."
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
            substeps: s.substeps.map((x) => ({
              id: x.id,
              title: x.title,
              completed: x.completed,
            })),
          })),
        }}
      />
    </div>
  );
}