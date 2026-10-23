import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading your journey">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="mt-4 h-10 w-full max-w-xl" />
      <Skeleton className="mt-4 h-5 w-96 max-w-full" />

      <div className="mt-10 grid gap-8 lg:grid-cols-[18rem_1fr]">
        <div className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-12 rounded-2xl" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>

        <div>
          <Skeleton className="h-96 rounded-3xl" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}