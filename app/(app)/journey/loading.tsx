import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading your journey">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="mt-4 h-10 w-full max-w-xl" />
      <Skeleton className="mt-4 h-5 w-96 max-w-full" />

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-3xl" />
        ))}
      </div>

      <Skeleton className="mt-8 h-[28rem] rounded-3xl" />
    </div>
  );
}