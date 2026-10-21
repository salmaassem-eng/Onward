import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="mt-3 h-5 w-96 max-w-full" />

      <div className="mt-8 grid gap-4 lg:grid-cols-5">
        <Skeleton className="h-64 rounded-2xl lg:col-span-3" />
        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-2xl" />
          ))}
        </div>
      </div>

      <Skeleton className="mt-8 h-44 rounded-3xl" />
    </div>
  );
}