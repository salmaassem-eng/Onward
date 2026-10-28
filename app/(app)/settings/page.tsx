import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getActivitySummary } from "@/lib/activity-queries";
import { requireUser } from "@/lib/session";
import { getUserSettings } from "@/lib/settings-queries";
import PageHeader from "@/components/app/PageHeader";
import ProfileCard from "@/components/settings/ProfileCard";
import JourneyStats from "@/components/settings/JourneyStats";
import NotificationsCard from "@/components/settings/NotificationsCard";
import AppearanceCard from "@/components/settings/AppearanceCard";
import SecurityCard from "@/components/settings/SecurityCard";
import DangerZone from "@/components/settings/DangerZone";

export default async function SettingsPage() {
  const user = await requireUser();

  const [prefs, activity, [account]] = await Promise.all([
    getUserSettings(user.id),
    getActivitySummary(user.id),
    db
      .select({ createdAt: users.createdAt })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1),
  ]);

  const memberSince = (account?.createdAt ?? new Date()).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Settings" subtitle="Manage your account and preferences." />

      <ProfileCard name={user.name} email={user.email} avatarVersion={user.avatarVersion} />
      <JourneyStats memberSince={memberSince} streak={activity.streak} total={activity.total} />
      <NotificationsCard
        email={user.email}
        initial={{
          dailyReminder: prefs.dailyReminder,
          reminderContent: prefs.reminderContent,
          reminderHour: prefs.reminderHour,
          weeklyDigest: prefs.weeklyDigest,
        }}
      />
      <AppearanceCard initial={prefs.theme} />
      <SecurityCard />
      <DangerZone />
    </div>
  );
}