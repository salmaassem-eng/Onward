import Container from "@/components/starterPage/Container";
import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading page">
      {/* hero */}
      <section className="pb-16 pt-20 sm:pt-28">
        <Container className="flex flex-col items-center">
          <Skeleton className="h-8 w-64 rounded-full" />
          <Skeleton className="mt-10 h-16 w-full max-w-2xl sm:h-20" />
          <Skeleton className="mt-4 h-16 w-full max-w-xl sm:h-20" />
          <Skeleton className="mt-8 h-4 w-full max-w-lg" />
          <Skeleton className="mt-3 h-4 w-full max-w-md" />
          <div className="mt-10 flex gap-3">
            <Skeleton className="h-14 w-48 rounded-xl" />
            <Skeleton className="h-14 w-48 rounded-xl" />
          </div>
        </Container>
      </section>

      {/* app preview card */}
      <section className="pb-24">
        <Container>
          <Skeleton className="h-96 w-full rounded-3xl" />
        </Container>
      </section>
    </div>
  );
}
