import Logo from "../Logo";
import Container from "./Container";

export default function Footer() {
  return (
    <footer className="border-t border-stone-200/80">
      <Container className="flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
        <Logo variant="onLight" size="md" />
        <p className="text-sm text-stone-400">
          © {new Date().getFullYear()} Onward. Keep moving.
        </p>
      </Container>
    </footer>
  );
}