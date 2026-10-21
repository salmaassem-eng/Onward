import Skeleton from "@/components/ui/Skeleton";

export default function AuthFormSkeleton({ fields }: { fields: number }) {
  return (
    <div role="status" aria-label="Loading form">
      {/* title + subtitle */}
      <Skeleton className="h-9 w-56" />
      <Skeleton className="mt-3 h-4 w-72 max-w-full" />

      {/* fields */}
      <div className="mt-8 space-y-5">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i}>
            <Skeleton className="mb-2 h-4 w-28" />
            <Skeleton className="h-[52px] w-full rounded-xl" />
          </div>
        ))}
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>

      {/* bottom link */}
      <Skeleton className="mx-auto mt-8 h-4 w-60" />
    </div>
  );
}