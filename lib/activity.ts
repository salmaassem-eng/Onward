import { addDays, shortDate } from "./dates";

export const WINDOW_DAYS = 28;

export type ActivityDay = { date: string; label: string; count: number };

export type ActivitySummary = {
  streak: number;
  longestStreak: number;
  doneToday: boolean;
  total: number;
  activeDays: number;
  activities: number;
  days: ActivityDay[];
};

export function summarizeActivity(counts: Map<string, number>, today: string): ActivitySummary {
  // current streak: today counts if you did something; if not, yesterday keeps it alive
  let cursor = counts.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (counts.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }

  let longestStreak = 0;
  let run = 0;
  let prev: string | null = null;
  for (const key of [...counts.keys()].sort()) {
    run = prev && addDays(prev, 1) === key ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
    prev = key;
  }

  const days: ActivityDay[] = Array.from({ length: WINDOW_DAYS }, (_, i) => {
    const date = addDays(today, i - (WINDOW_DAYS - 1));
    return { date, label: shortDate(date), count: counts.get(date) ?? 0 };
  });

  return {
    streak,
    longestStreak,
    doneToday: counts.has(today),
    total: [...counts.values()].reduce((a, b) => a + b, 0),
    activeDays: days.filter((d) => d.count > 0).length,
    activities: days.reduce((sum, d) => sum + d.count, 0),
    days,
  };
}