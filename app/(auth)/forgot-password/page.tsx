import Link from "next/link";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import { RESET_MINUTES } from "@/lib/password-reset";

export default function ForgotPasswordPage() {
  return (
    <>
      <h2 className="font-heading text-3xl font-bold text-stone-900">Forgot your password?</h2>
      <p className="mt-2 text-stone-500">
        Enter your email and we&apos;ll send you a link to choose a new one.
      </p>

      <ForgotPasswordForm minutes={RESET_MINUTES} />

      <p className="mt-8 text-center text-sm text-stone-500">
        Can&apos;t get to your email?{" "}
        <Link
          href="/forgot-password/recovery"
          className="font-semibold text-green-600 hover:underline"
        >
          Use a recovery code
        </Link>
      </p>
      <p className="mt-4 text-center">
        <Link href="/login" className="font-semibold text-green-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </>
  );
}