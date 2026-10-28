import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import AuthPanel from "@/components/AuthPanel";
import Logo from "@/components/Logo";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getSessionUser()) redirect("/dashboard");

  return (
    <div className="flex min-h-dvh">
      <AuthPanel />
      <main className="flex flex-1 flex-col justify-center bg-[#f8f8f4] px-6 py-10 sm:px-10 lg:items-center lg:py-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <Logo variant="onLight" size="md" />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}