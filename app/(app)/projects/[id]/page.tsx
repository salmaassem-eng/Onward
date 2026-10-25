import Link from "next/link";
import { notFound } from "next/navigation";
import { getGoalOptions, getUserProjectForEdit } from "@/lib/project-queries";
import { toProjectView } from "@/lib/projects";
import { requireUser } from "@/lib/session";
import PageHeader from "@/components/app/PageHeader";
import ProjectForm from "@/components/projects/ProjectForm";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const projectId = Number(id);
  if (!Number.isInteger(projectId)) notFound();

  const [project, goals] = await Promise.all([
    getUserProjectForEdit(user.id, projectId),
    getGoalOptions(user.id),
  ]);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/projects" className="text-sm text-stone-500 hover:text-stone-900">
        ← Back to projects
      </Link>
      <div className="mb-8 mt-4">
        <PageHeader
          title="Edit project"
          subtitle="Change the details, or add, remove and reorder milestones and tasks."
        />
      </div>
      <ProjectForm
        projectId={project.id}
        goals={goals}
        isFinished={toProjectView(project).isFinished}
        initial={{
          title: project.title,
          description: project.description ?? "",
          goalId: project.goalId ? String(project.goalId) : "",
          status: project.status,
          deadline: project.deadline ?? "",
          githubUrl: project.githubUrl ?? "",
          deployUrl: project.deployUrl ?? "",
          milestones: project.milestones.map((m) => ({
            id: m.id,
            title: m.title,
            completed: m.completed,
            tasks: m.tasks.map((t) => ({
              id: t.id,
              title: t.title,
              completed: t.completed,
            })),
          })),
        }}
      />
    </div>
  );
}