import Container from "./Container";

const testimonials = [
  {
    quote: "Finally a productivity app that doesn't make me feel behind. Just focused.",
    name: "Salma A.",
    role: "Software Engineer",
  },
  {
    quote: "The journey map changed how I think about my own progress.",
    name: "Abdelrahman M.",
    role: "Product Designer",
  },
  {
    quote: "I actually look forward to opening this every morning.",
    name: "Alaa A.",
    role: "Freelance Developer",
  },
];

export default function Testimonials() {
  return (
    <section className="pb-16 pt-24">
      <Container>
        <h2 className="font-heading text-center text-4xl font-bold text-stone-900">
          People who keep moving
        </h2>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="rounded-3xl border border-stone-200 bg-white p-8"
            >
              <blockquote className="leading-relaxed text-stone-600">
                &quot;{t.quote}&quot;
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 font-semibold text-green-700">
                  {t.name[0]}
                </span>
                <span>
                  <span className="block font-semibold text-stone-900">
                    {t.name}
                  </span>
                  <span className="block text-sm text-stone-400">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}