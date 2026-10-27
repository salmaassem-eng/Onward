import Link from "next/link";
import type { CourseView } from "@/lib/learning";
import CourseThumb from "./CourseThump";

export default function CourseCard({
  course,
  selected,
}: {
  course: CourseView;
  selected: boolean;
}) {
  return (
    <Link
      href={`/learning?course=${course.id}`}
      scroll={false}
      aria-current={selected ? "true" : undefined}
      className={`block w-64 shrink-0 overflow-hidden rounded-2xl border bg-white transition lg:w-auto ${
        selected
          ? "border-green-400 ring-2 ring-green-100"
          : "border-stone-200 hover:border-stone-300"
      }`}
    >
      <CourseThumb src={course.thumbnailUrl} className="h-28">
        <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-white">
          {course.progress}%
        </span>
        <div className="absolute inset-x-4 bottom-3 h-1.5 rounded-full bg-white/30">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${course.progress}%` }}
          />
        </div>
      </CourseThumb>

      <div className="p-4">
        <h3 className="font-heading line-clamp-2 font-semibold leading-snug text-stone-900">
          {course.title}
        </h3>
        <p className="mt-1 truncate text-sm text-stone-400">{course.subtitle}</p>
        <p className="mt-2 text-xs text-stone-400">
          Last: {course.lastLabel} · {course.lessonsDone}/{course.lessonsTotal} lessons
        </p>
      </div>
    </Link>
  );
}