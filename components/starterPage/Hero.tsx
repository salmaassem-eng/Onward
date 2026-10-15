import Container from "./Container";
import ButtonLink from "./Button";

export default function Hero() {
  return (
    <section className="pb-16 pt-20 sm:pt-28">
      <Container className="text-center">
        <h1 className="font-heading text-5xl font-extrabold leading-[1.05] tracking-tight text-stone-900 sm:text-7xl">
          See where you are
          <br />
          <span className="text-green-600">Know what&apos;s next.</span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-md leading-relaxed text-stone-400">
          Onward turns your goals into a visual journey. Not another todo list —
          a calm, clear map of where you&apos;re going and how far you&apos;ve
          come.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/signup" size="lg">
            Start your journey →
          </ButtonLink>
          <ButtonLink href="/login" variant="secondary" size="lg">
            Sign in to my account
          </ButtonLink>
        </div>

        {/* <p className="mt-6 text-sm text-stone-400">
          Free to use · No credit card required
        </p> */}
      </Container>
    </section>
  );
}