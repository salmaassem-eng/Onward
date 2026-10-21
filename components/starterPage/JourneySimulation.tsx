import { Check, Sparkles, Target } from "lucide-react";
import Container from "./Container";

type Milestone = {
    label: string;
    status: "done" | "current" | "upcoming";
    progress?: number;
    isFinal?: boolean;
};

const points = [
    "Visual progress map of your entire journey",
    "Your current position, always visible",
    'Smart "what\'s next" suggestions',
    "Branches for different areas of life",
];

const milestones: Milestone[] = [
    { label: "React Mastery", status: "done" },
    { label: "Next.js", status: "current", progress: 70 },
    { label: "Backend & API", status: "upcoming" },
    { label: "Portfolio Projects", status: "upcoming" },
    { label: "Full-Stack Dev", status: "upcoming", isFinal: true },
];

export default function JourneyMap() {
    return (
        <section className="bg-[#1c1917] py-24">
            <Container className="grid items-center gap-28 lg:grid-cols-2">
                {/* text side */}
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-green-400">
                        <Sparkles className="h-4 w-4" />
                        The Journey Map
                    </div>

                    <h2 className="font-heading mt-8 text-4xl font-bold leading-tight text-white sm:text-5xl">
                        You are here.
                        <br />
                        <span className="text-green-400">This is where you&apos;re going.</span>
                    </h2>

                    <p className="mt-6 max-w-lg text-lg leading-relaxed text-stone-300">
                        See your entire path at once — completed milestones, your current
                        position, and what&apos;s coming next. Never lose sight of the
                        bigger picture.
                    </p>

                    <ul className="mt-8 space-y-4">
                        {points.map((point) => (
                            <li key={point} className="flex items-center gap-3 text-stone-400">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-900/60 text-green-500">
                                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                </span>
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* timeline card */}
                <div className="p-8">
                    <ol className="relative space-y-6">
                        {/* vertical line behind the dots */}
                        <div className="absolute bottom-4 left-4 top-4 w-px -translate-x-1/2 bg-white/10" />

                        {milestones.map((m) => (
                            <li key={m.label} className="relative flex items-start gap-3">
                                {/* marker */}
                                <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center bg-[#1c1917]">
                                    {m.status === "done" && (
                                            <span className="relative h-3 w-3 rounded-full bg-green-400" />
                                    )}

                                    {m.status === "current" && (
                                        <>
                                            <span className="absolute h-5 w-5 animate-ping rounded-full bg-green-400/40" />
                                            <span className="relative h-3 w-3 rounded-full bg-green-400" />
                                        </>
                                    )}

                                    {m.status === "upcoming" && (
                                        <span className="h-3 w-3 rounded-full border-2 border-stone-600" />
                                    )}
                                </span>

                                {/* label */}
                                <div className={`flex-1 pt-1 ${m.status === "current" ? "breathe" : ""}`}>
                                    <p
                                        className={`font-semibold ${m.status === "done"
                                                ? "text-green-400 line-through opacity-50"
                                                : m.status === "current"
                                                    ? "text-lg text-white"
                                                    : "text-stone-600"
                                            }`}
                                    >
                                        {m.label}
                                    </p>

                                    {m.status === "current" && (
                                        <div className="mt-2 h-1.5 w-40 rounded-full bg-white/10">
                                            <div
                                                className="h-full rounded-full bg-green-400"
                                                style={{ width: `${m.progress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </Container>
        </section>
    );
}