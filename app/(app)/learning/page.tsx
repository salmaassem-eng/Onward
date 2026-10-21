import { GraduationCap } from "lucide-react";
import { requireUser } from "@/lib/session";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";

export default async function LearningPage() {
  await requireUser();

  return (
    <>
      <PageHeader
        title="Learning"
        subtitle="Courses and lessons you’re working through, Expand your knowledge and skills."
      />
      <div className="mt-10">
        <EmptyState
          icon={GraduationCap}
          title="No learning resources yet"
          text="Add a course or a topic to track your progress."
        />
      </div>
    </>
  );
}