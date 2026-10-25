import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading projects">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="mt-3 h-5 w-40" />
      <div className="mt-8 flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-full" />
        ))}
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}