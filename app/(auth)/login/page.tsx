import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <>
      <h2 className="font-[family-name:var(--font-jakarta)] text-3xl font-bold text-stone-900">
        Welcome back
      </h2>
      <p className="mt-2 text-stone-500">Good to see you. Let&apos;s keep moving.</p>

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