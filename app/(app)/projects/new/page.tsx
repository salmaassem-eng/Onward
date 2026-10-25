import Link from "next/link";
import { getGoalOptions } from "@/lib/project-queries";
import { requireUser } from "@/lib/session";
import PageHeader from "@/components/app/PageHeader";
import ProjectForm from "@/components/projects/ProjectForm";

export default async function NewProjectPage() {
  const user = await requireUser();
  const goals = await getGoalOptions(user.id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/projects" className="text-sm text-stone-500 hover:text-stone-900">
        ← Back to projects
      </Link>
      <div className="mb-8 mt-4">
        <PageHeader
          title="New project"
          subtitle="Name it, connect it to a goal, then break it into milestones."
        />
      </div>
      <ProjectForm goals={goals} />
    </div>
  );
}