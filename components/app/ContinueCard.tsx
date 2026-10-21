import Button from "@/components/starterPage/Button";

export default function ContinueCard() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#1c1917] p-8 sm:p-10">
      <div className="pointer-events-none absolute -right-10 -top-10 h-80 w-80 bg-[radial-gradient(circle,rgba(34,197,94,0.15),transparent_70%)]" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-green-400">
            Start here
          </p>
          <h2 className="font-heading mt-3 text-3xl font-bold text-white">
            Nothing to continue yet
          </h2>
          <p className="mt-2 max-w-md text-stone-400">
            Add a goal or a course and it will show up here, so you can jump
            back in any time.
          </p>
        </div>
        <Button href="/goals" size="lg">
          Set your first goal →
        </Button>
      </div>
    </section>
  );
}