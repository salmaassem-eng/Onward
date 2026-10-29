import { GraduationCap, Plus } from "lucide-react";
import { getUserCourses } from "@/lib/course-queries";
import { requireUser } from "@/lib/session";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import ButtonLink from "@/components/starterPage/Button";
import CourseDetail from "@/components/learning/CourseDetail";
import CourseList from "@/components/learning/CourseList";

export default async function LearningPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  const user = await requireUser();
  const { course: courseParam } = await searchParams;
  const courses = await getUserCourses(user.id);

  const selected =
    courses.find((c) => String(c.id) === courseParam) ??
    courses.find((c) => !c.isComplete) ??
    courses[0];

  const inProgress = courses.filter((c) => !c.isComplete).length;
  const subtitle =
    courses.length === 0
      ? "Courses and lessons you're working through."
      : `${courses.length} ${courses.length === 1 ? "course" : "courses"} · ${inProgress} in progress`;

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <PageHeader title="Learning" subtitle={subtitle} />
        <ButtonLink href="/learning/new" size="header" className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Add course
        </ButtonLink>
      </div>

      <div className="mt-6 sm:mt-8">
        {!selected ? (
          <EmptyState
            icon={GraduationCap}
            title="Nothing to learn yet"
            text="Paste a YouTube, Udemy or Coursera link and Onward fills in the details, or add a course by hand."
            action={{ href: "/learning/new", label: "Add a course" }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
            <CourseList courses={courses} selectedId={selected.id} />
            <div id="course-detail" className="min-w-0 scroll-mt-20 lg:scroll-mt-6">
              <CourseDetail key={selected.id} course={selected} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}