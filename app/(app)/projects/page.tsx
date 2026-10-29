import { FolderOpen, Plus } from "lucide-react";
import { getUserProjects } from "@/lib/project-queries";
import { requireUser } from "@/lib/session";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import ProjectsBoard from "@/components/projects/ProjectsBoard";
import ButtonLink from "@/components/starterPage/Button";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ open?: string }>;
}) {
  const user = await requireUser();
  const { open } = await searchParams;
  const projects = await getUserProjects(user.id);
  const openId = Number(open);

  const active = projects.filter((p) => p.state === "active").length;
  const subtitle =
    projects.length === 0
      ? "Things you're building."
      : `${active} active ${active === 1 ? "project" : "projects"}`;

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <PageHeader title="Projects" subtitle={subtitle} />
        <ButtonLink href="/projects/new" size="header" className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          New project
        </ButtonLink>
      </div>

      <div className="mt-8">
        {projects.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No projects yet"
            text="Start a project, break it into milestones, and connect it to a goal or keep it as a freelance job."
            action={{ href: "/projects/new", label: "Create a project" }}
          />
        ) : (
          <ProjectsBoard
            projects={projects}
            initialOpenId={projects.some((p) => p.id === openId) ? openId : null}
          />)}
      </div>
    </>
  );
}