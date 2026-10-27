import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading your courses">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="mt-3 h-5 w-48" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[20rem_1fr]">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[34rem] rounded-3xl" />
      </div>
    </div>
  );
}