import {
  ArrowRight,
  Map as MapIcon,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import Container from "./Container";

type Feature = {
  icon: LucideIcon;
  title: string;
  text: string;
  card: string;
  iconBox: string;
};

const features: Feature[] = [
  {
    icon: Target,
    title: "Create your goals",
    text: "Start with what you want to achieve. Career, learning, health, or personal — each goal gets its own structure.",
    card: "bg-green-50 border-green-100",
    iconBox: "bg-green-100 text-green-600",
  },
  {
    icon: MapIcon,
    title: "Break them down",
    text: "Turn big goals into smaller, reachable steps. Onward maps the path so you never feel lost.",
    card: "bg-violet-50 border-violet-100",
    iconBox: "bg-violet-100 text-violet-600",
  },
  {
    icon: TrendingUp,
    title: "Track your progress",
    text: "See how far you've come with visual progress that updates automatically as you work.",
    card: "bg-sky-100 border-sky-200/60",
    iconBox: "bg-sky-200/70 text-sky-600",
  },
  {
    icon: ArrowRight,
    title: "Know what's next",
    text: "Onward always surfaces your next step. No decision fatigue, no overwhelm.",
    card: "bg-amber-100 border-amber-200/60",
    iconBox: "bg-amber-200/70 text-amber-700",
  },
];

export default function Features() {
  return (
    <section className="py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-4xl font-bold leading-tight text-stone-900 sm:text-5xl">
            Your life isn&apos;t a checklist.
            <br />
            It&apos;s a journey.
          </h2>
          <p className="mt-6 text-md text-stone-400">
            Onward is built around one idea: keep moving forward, one step at a
            time.
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text, card, iconBox }) => (
            <div
              key={title}
              className={`rounded-3xl border p-7 ${card}`}
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBox}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-heading mt-6 text-lg font-semibold text-stone-900">
                {title}
              </h3>
              <p className="mt-3 leading-relaxed text-stone-500">{text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}