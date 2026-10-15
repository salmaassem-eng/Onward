import AuthPanel from "@/components/AuthPanel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AuthPanel />
      <main className="flex flex-1 items-center justify-center bg-[#f8f8f4] px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}