import Logo from "./Logo";
import Checklist from "./Checklist";

export default function AuthPanel() {
  return (
    <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#1c1917] p-14 lg:flex">
      {/* living green glow */}
      <div className="glow-drift pointer-events-none absolute left-[10%] top-[20%] h-[500px] w-[500px] bg-[radial-gradient(circle,rgba(34,197,94,0.18),transparent_70%)]" />

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

        <Checklist />
      </div>

      <p className="relative text-stone-500">
        You don&apos;t have to do everything today. Just keep moving.
      </p>
    </aside>
  );
}