import AppSidebar from "@/components/app/AppSidebar";
import MobileNav from "@/components/app/MobileNav";
import { requireUser } from "@/lib/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-[#f8f8f4] lg:flex">
      <AppSidebar user={user} />
      <div className="min-w-0 flex-1">
        <MobileNav />
        <main className="mx-auto w-full max-w-5xl px-6 py-10 lg:px-10 lg:py-12">
          {children}
        </main>
      </div>
    </div>
  );
}