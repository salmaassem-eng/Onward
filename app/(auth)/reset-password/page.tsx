import type { Metadata } from "next";
import Link from "next/link";
import { isResetTokenValid } from "@/lib/password-reset";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import ButtonLink from "@/components/starterPage/Button";

// the token is in the address: never send it to other sites, never index the page
export const metadata: Metadata = {
  title: "Reset password",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const valid = token ? await isResetTokenValid(token) : false;

  if (!valid || !token) {
    return (
      <>
        <h2 className="font-heading text-3xl font-bold text-stone-900">
          This link doesn&apos;t work
        </h2>
        <p className="mt-2 text-stone-500">
          It may have expired, or it was already used. Reset links work once.
        </p>
        <div className="mt-8">
          <ButtonLink href="/forgot-password" size="lg" className="w-full">
            Get a new link
          </ButtonLink>
        </div>
        <p className="mt-6 text-center">
          <Link href="/login" className="font-semibold text-green-600 hover:underline">
            Back to sign in
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h2 className="font-heading text-3xl font-bold text-stone-900">Choose a new password</h2>
      <p className="mt-2 text-stone-500">
        Pick something new. You will be signed out on all your devices.
      </p>
      <ResetPasswordForm token={token} />
    </>
  );
}