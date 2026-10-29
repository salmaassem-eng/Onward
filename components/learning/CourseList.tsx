"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CourseView } from "@/lib/learning";
import CourseCard from "./CourseCard";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function CourseList({
  courses,
  selectedId,
}: {
  courses: CourseView[];
  selectedId: number;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setEdge({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  // keep the arrows in sync with the scroll position
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update, courses.length]);

  // bring the selected course into view (phones only: on desktop the list is vertical)
  useEffect(() => {
    const el = scroller.current;
    const card = el?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!el || !card || window.matchMedia("(min-width: 1024px)").matches) return;

    el.scrollTo({
      left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2,
      behavior: reducedMotion() ? "auto" : "smooth",
    });
  }, [selectedId]);

  function scrollByCard(direction: -1 | 1) {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("a");
    const step = (card?.offsetWidth ?? 256) + 16;
    el.scrollBy({ left: direction * step, behavior: reducedMotion() ? "auto" : "smooth" });
  }

  const canScroll = !(edge.start && edge.end);
  const arrow =
    "flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 transition hover:bg-stone-50 disabled:opacity-35";

  return (
    <div className="min-w-0">
      <div className="mb-3 flex items-center justify-between lg:hidden">
        <p className="text-sm font-semibold text-stone-600">
          Your courses <span className="font-normal text-stone-400">· {courses.length}</span>
        </p>
        {canScroll && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={edge.start}
              aria-label="Previous courses"
              className={arrow}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={edge.end}
              aria-label="Next courses"
              className={arrow}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div
        ref={scroller}
        className="relative flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] lg:snap-none lg:flex-col lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden"
      >
        {courses.map((c) => (
          <CourseCard key={c.id} course={c} selected={c.id === selectedId} />
        ))}
      </div>
    </div>
  );
}