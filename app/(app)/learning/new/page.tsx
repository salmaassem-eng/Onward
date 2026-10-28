import Link from "next/link";
import { getGoalOptions } from "@/lib/project-queries";
import { requireUser } from "@/lib/session";
import PageHeader from "@/components/app/PageHeader";
import CourseForm from "@/components/learning/CourseForm";

export default async function NewCoursePage() {
  const user = await requireUser();
  const goals = await getGoalOptions(user.id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/learning" className="text-sm text-stone-500 hover:text-stone-900">
        ← Back to learning
      </Link>
      <div className="mb-8 mt-4">
        <PageHeader
          title="Add a course"
          subtitle="Paste a link and we'll fill in what we can, or add it by hand."
        />
      </div>
      <CourseForm goals={goals} />
    </div>
  );
}