import Logo from "./Logo";

const steps = [
  { label: "Set your first goal", done: true },
  { label: "Build your journey map", done: true },
  { label: "Take one step forward", done: false },
];

export default function AuthPanel() {
  return (
    <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#1c1917] p-14 lg:flex">
      {/* soft green glow */}
      <div className="pointer-events-none absolute left-1/3 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(34,197,94,0.15),transparent_70%)]" />

      <div className="relative">
        <Logo />
      </div>

      <div className="relative max-w-xl">
        <h1 className="font-[family-name:var(--font-jakarta)] text-5xl font-bold leading-tight text-white">
          Your journey
          <br />
          starts here.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-stone-400">
          Every goal you&apos;ve ever had is within reach. Onward helps you see
          the path and take the next step — one at a time.
        </p>

        <ul className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          {steps.map((step) => (
            <li key={step.label} className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  step.done ? "bg-green-500" : "border border-stone-600"
                }`}
              >
                {step.done && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                )}
              </span>
              <span className={step.done ? "text-green-300" : "text-stone-500"}>
                {step.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-stone-500">
        You don&apos;t have to do everything today. Just keep moving.
      </p>
    </aside>
  );
}