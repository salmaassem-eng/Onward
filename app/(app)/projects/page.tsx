import { FolderOpen, Target } from "lucide-react";
import { requireUser } from "@/lib/session";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";

export default async function ProjectsPage() {
  await requireUser();

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle="Your work, you’re building."
      />
      <div className="mt-10">
        <EmptyState
          icon={FolderOpen}
          title="No projects yet"
          text="Start a project and track it next to your goals."
        />
      </div>
    </>
  );
}