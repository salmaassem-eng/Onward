import Link from "next/link";
import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <>
      <h2 className="font-[family-name:var(--font-jakarta)] text-3xl font-bold text-stone-900">
        Create your account
      </h2>
      <p className="mt-2 text-stone-500">Start organizing your goals and progress.</p>

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