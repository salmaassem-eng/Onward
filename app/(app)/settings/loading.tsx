import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading settings" className="mx-auto max-w-2xl">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="mt-3 h-5 w-72 max-w-full" />
      <div className="mt-8 space-y-6">
        <Skeleton className="h-96 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    </div>
  );
}