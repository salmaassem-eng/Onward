import Link from "next/link";
import AuthToast from "@/components/AuthToast";
import GoogleButton from "@/components/GoogleButton";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <>
      <AuthToast code={error} />

      <h2 className="font-heading text-3xl font-bold text-stone-900">Welcome back</h2>
      <p className="mt-2 text-stone-500">Good to see you. Let&apos;s keep moving.</p>

      <div className="mt-8">
        <GoogleButton label="Continue with Google" />
      </div>
      <div className="mt-6 flex items-center gap-4 text-sm text-stone-400" aria-hidden>
        <span className="h-px flex-1 bg-stone-200" />
        or
        <span className="h-px flex-1 bg-stone-200" />
      </div>

      <LoginForm />

      <p className="mt-8 text-center text-stone-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-green-600 hover:underline">
          Sign up free
        </Link>
      </p>
      <p className="mt-4 text-center text-sm">
        <Link href="/forgot-password" className="text-stone-400 hover:text-stone-600">
          Forgot your password?
        </Link>
      </p>
    </>
  );
}