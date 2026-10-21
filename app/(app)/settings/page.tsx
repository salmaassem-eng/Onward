import { Settings } from "lucide-react";
import { requireUser } from "@/lib/session";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";

export default async function SettingsPage() {
  await requireUser();

  return (
    <>
      <PageHeader
        title="Goals"
        subtitle="Everything you want to achieve, in one place."
      />
      <div className="mt-10">
        <EmptyState
          icon={Settings}
          title="No settings yet"
          text="Settings will show up here."
        />
      </div>
    </>
  );
}