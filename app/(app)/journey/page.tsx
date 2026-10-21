import { Compass } from "lucide-react";
import { requireUser } from "@/lib/session";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";

export default async function JourneyPage() {
  await requireUser();

  return (
    <>
      <PageHeader
        title="My Journey"
        subtitle="Your path from where you are to where you’re going."
      />
      <div className="mt-10">
        <EmptyState
          icon={Compass}
          title="Your map is empty"
          text="Add a goal and break it into steps. Your journey map builds itself from them."
        />
      </div>
    </>
  );
}