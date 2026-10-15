import Link from "next/link";
import Logo from "../Logo";
import Container from "./Container";
import ButtonLink from "./Button";

export default function Navbar() {
  return (
    <header className="border-b border-stone-200/80">
      <Container className="flex h-20 items-center justify-between">
        <Logo variant="onLight" size="md" />

        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-stone-600 hover:text-stone-900 sm:inline"
          >
            Sign in
          </Link>
          <ButtonLink href="/signup">Get started free</ButtonLink>
        </div>
      </Container>
    </header>
  );
}