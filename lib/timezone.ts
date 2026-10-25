import "server-only";
import { cookies } from "next/headers";

export async function getTimezone() {
  const store = await cookies();
  const raw = store.get("tz")?.value;
  if (raw) {
    try {
      const tz = decodeURIComponent(raw);
      new Intl.DateTimeFormat("en-US", { timeZone: tz }); // throws if invalid
      return tz;
    } catch {}
  }
  return "UTC";
}

export function dayFormatter(timeZone: string) {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone }); // gives YYYY-MM-DD
  return (d: Date) => f.format(d);
}

export async function getToday() {
  return dayFormatter(await getTimezone())(new Date());
}