"use client";

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
  function scrollToDetail() {
    // on phones the details are below the cards, so go there
    if (!window.matchMedia("(max-width: 1023px)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document
      .getElementById("course-detail")
      ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  return (
    <Link
      href={`/learning?course=${course.id}`}
      scroll={false}
      onClick={scrollToDetail}
      aria-current={selected ? "true" : undefined}
      className={`block w-64 shrink-0 snap-start overflow-hidden rounded-2xl border bg-white transition lg:w-auto ${
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
        <h3
          dir="auto"
          className="font-heading line-clamp-2 break-words font-semibold leading-snug text-stone-900"
        >
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