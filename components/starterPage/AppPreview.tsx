// it's static like a real app, but it's not interactive. It's just a visual representation of what the app could look like.
// AI Generated !!!!!!!

import {
  Compass,
  FolderOpen,
  Home,
  Layers,
  ListOrdered,
  Target,
} from "lucide-react";
import Container from "./Container";

const navItems = [
  { icon: Home, barWidth: "w-14", active: true },
  { icon: Compass, barWidth: "w-10", active: false },
  { icon: Target, barWidth: "w-14", active: false },
  { icon: FolderOpen, barWidth: "w-16", active: false },
  { icon: Layers, barWidth: "w-20", active: false },
  { icon: ListOrdered, barWidth: "w-20", active: false },
];

const todayRows = [true, false, false];
const weekBars = [60, 30, 45, 75, 30, 4, 45];

export default function AppPreview() {
  return (
    <section className="">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.12)] sm:p-8">
          <div className="grid gap-8 md:grid-cols-[14rem_1fr]">
            {/* sidebar */}
            <div className="hidden space-y-2 md:block">
              {navItems.map(({ icon: Icon, barWidth, active }, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                    active ? "bg-green-50" : ""
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      active ? "text-green-600" : "text-stone-400"
                    }`}
                  />
                  <div
                    className={`h-2 rounded-full ${barWidth} ${
                      active ? "bg-green-200" : "bg-stone-100"
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* main area */}
            <div>
              <div className="h-8 w-56 rounded-lg bg-stone-100" />
              <div className="mt-3 h-3 w-40 rounded-full bg-stone-100" />

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {/* continue learning */}
                <div className="rounded-2xl border border-green-100 bg-green-50 p-5 md:col-span-2">
                  <p className="text-sm font-semibold text-green-600">
                    Continue learning
                  </p>
                  <div className="mt-4 h-6 w-48 rounded-md bg-green-100" />
                  <div className="mt-2 h-2.5 w-32 rounded-full bg-green-100" />
                  <div className="mt-6 h-2.5 rounded-full bg-green-100">
                    <div className="h-full w-[72%] rounded-full bg-green-500" />
                  </div>
                </div>

                {/* today */}
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
                  <p className="text-sm font-semibold text-stone-500">Today</p>
                  <div className="mt-4 space-y-3">
                    {todayRows.map((done, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span
                          className={`h-4 w-4 shrink-0 rounded-full border ${
                            done
                              ? "border-green-400 bg-green-400"
                              : "border-stone-300 bg-white"
                          }`}
                        />
                        <div className="h-2 flex-1 rounded-full bg-stone-200" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* goal */}
                <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
                  <p className="text-sm font-semibold text-violet-600">Goal</p>
                  <div className="mt-4 h-6 w-28 rounded-md bg-violet-100" />
                  <div className="mt-4 h-2.5 rounded-full bg-violet-100">
                    <div className="h-full w-[70%] rounded-full bg-violet-300" />
                  </div>
                </div>

                {/* this week */}
                <div className="rounded-2xl border border-sky-100 bg-sky-50 p-5 md:col-span-2">
                  <p className="text-sm font-semibold text-sky-600">This week</p>
                  <div className="mt-4 flex h-14 items-end gap-2">
                    {weekBars.map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm bg-sky-200"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* fade at the bottom of the card */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_top,white,transparent)]" />
        </div>
      </Container>
    </section>
  );
}