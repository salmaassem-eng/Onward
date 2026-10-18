import Container from "./Container";
import ButtonLink from "./Button";

export default function Banner() {
  return (
    <section className="pb-16 pt-8">
        <div className="bg-green-600 px-6 py-16 text-center sm:py-20">
          <h2 className="font-heading text-4xl font-bold text-white sm:text-5xl">
            Ready to start moving?
          </h2>
          <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-green-50">
            You don&apos;t have to do everything today. Just take the first
            step. Onward will show you the rest.
          </p>
          <div className="mt-10">
            <ButtonLink href="/signup" variant="light" size="lg">
              Start for free →
            </ButtonLink>
          </div>
        </div>
    </section>
  );
}