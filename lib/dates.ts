const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDate(value: string) {
  if (!ISO.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function addDays(value: string, days: number) {
  const d = new Date(`${value}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// weeks start on Monday
export function startOfWeek(value: string) {
  const dow = new Date(`${value}T00:00:00Z`).getUTCDay(); // 0 = Sunday
  return addDays(value, -((dow + 6) % 7));
}

export const weekDates = (start: string) =>
  Array.from({ length: 7 }, (_, i) => addDays(start, i));

const fmt = (value: string, options: Intl.DateTimeFormatOptions) =>
  new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", {
    ...options,
    timeZone: "UTC",
  });

export const weekdayName = (v: string) => fmt(v, { weekday: "long" });
export const weekdayShort = (v: string) => fmt(v, { weekday: "short" });
export const shortDate = (v: string) => fmt(v, { month: "short", day: "numeric" });

export function formatWeekRange(start: string) {
  const end = addDays(start, 6);
  return `${shortDate(start)} – ${shortDate(end)}, ${end.slice(0, 4)}`;
}