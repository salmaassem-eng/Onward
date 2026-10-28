import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserCourseForEdit } from "@/lib/course-queries";
import { getGoalOptions } from "@/lib/project-queries";
import { requireUser } from "@/lib/session";
import PageHeader from "@/components/app/PageHeader";
import CourseForm from "@/components/learning/CourseForm";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const courseId = Number(id);
  if (!Number.isInteger(courseId)) notFound();

  const [course, goals] = await Promise.all([
    getUserCourseForEdit(user.id, courseId),
    getGoalOptions(user.id),
  ]);
  if (!course) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/learning" className="text-sm text-stone-500 hover:text-stone-900">
        ← Back to learning
      </Link>
      <div className="mb-8 mt-4">
        <PageHeader
          title="Edit course"
          subtitle="Change the details, or add, remove and reorder modules and lessons."
        />
      </div>
      <CourseForm
        courseId={course.id}
        goals={goals}
        initial={{
          title: course.title,
          url: course.url ?? "",
          thumbnailUrl: course.thumbnailUrl ?? "",
          goalId: course.goalId ? String(course.goalId) : "",
          modules: course.modules.map((m) => ({
            id: m.id,
            title: m.title,
            lessons: m.lessons.map((l) => ({
              id: l.id,
              title: l.title,
              url: l.url ?? "",
              completed: l.completed,
            })),
          })),
        }}
      />
    </div>
  );
}