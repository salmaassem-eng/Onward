import AppSidebar from "@/components/app/AppSidebar";
import MobileNav from "@/components/app/MobileNav";
import ThemeSync from "@/components/app/ThemeSync";
import TimezoneSync from "@/components/app/TimezoneSync";
import { requireUser } from "@/lib/session";
import { getUserSettings } from "@/lib/settings-queries";
import { getTimezone } from "@/lib/timezone";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [timezone, prefs] = await Promise.all([getTimezone(), getUserSettings(user.id)]);

  return (
    <div data-app className="min-h-dvh bg-cream text-stone-900 lg:flex">
      <TimezoneSync current={timezone} />
      <ThemeSync theme={prefs.theme} />
      <AppSidebar user={user} />
      <div className="min-w-0 flex-1">
        <MobileNav user={user} />
        <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-12">
          {children}
        </main>
      </div>
    </div>
  );
}