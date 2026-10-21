import { CalendarDays } from "lucide-react";
import { requireUser } from "@/lib/session";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";

export default async function WeekPage() {
  await requireUser();

  return (
    <>
      <PageHeader
        title="This Week"
        subtitle="What you plan to do over the next seven days."
      />
      <div className="mt-10">
        <EmptyState
          icon={CalendarDays}
          title="Your week is clear"
          text="Planned tasks will show up here."
        />
      </div>
    </>
  );
}