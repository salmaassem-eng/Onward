import Link from "next/link";
import { requireUser } from "@/lib/session";
import PageHeader from "@/components/app/PageHeader";
import GoalForm from "@/components/app/Goals/GoalForm";

export default async function NewGoalPage() {
  await requireUser();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/goals" className="text-sm text-stone-500 hover:text-stone-900">
        ← Back to goals
      </Link>
      <div className="mb-8 mt-4">
        <PageHeader
          title="New goal"
          subtitle="Name it, then break it into steps."
        />
      </div>
      <GoalForm />
    </div>
  );
}