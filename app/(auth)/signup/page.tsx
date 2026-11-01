import Link from "next/link";
import AuthToast from "@/components/AuthToast";
import GoogleButton from "@/components/GoogleButton";
import SignupForm from "@/components/SignupForm";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <>
      <AuthToast code={error} />

      <h2 className="font-heading text-3xl font-bold text-stone-900">Create your account</h2>
      <p className="mt-2 text-stone-500">Start organizing your goals and progress.</p>

      <div className="mt-8">
        <GoogleButton label="Sign up with Google" />
      </div>
      <div className="mt-6 flex items-center gap-4 text-sm text-stone-400" aria-hidden>
        <span className="h-px flex-1 bg-stone-200" />
        or
        <span className="h-px flex-1 bg-stone-200" />
      </div>

      <SignupForm />

      <p className="mt-8 text-center text-stone-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-green-600 hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}