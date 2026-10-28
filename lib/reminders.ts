import "server-only";
import { and, eq, isNull, ne, or } from "drizzle-orm";
import { db } from "@/db";
import { userSettings, users } from "@/db/schema";
import { getActivitySummary } from "./activity-queries";
import { startOfWeek, weekDates } from "./dates";
import { sendEmail } from "./email";
import { dailyEmail, weeklyEmail, type EmailContent } from "./email-templates";
import { getUserGoals } from "./goal-queries";
import { getPlanItems } from "./plan-queries";
import { DEFAULT_PREFERENCES, type ReminderContent } from "./settings";
import { dayFormatter } from "./timezone";

const appUrl = () => (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

function safeZone(tz: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
}

function localParts(now: Date, tz: string) {
  const date = dayFormatter(tz)(now);
  const hour = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hourCycle: "h23" }).format(now)
  );
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay(); // 0 = Sunday
  return { date, hour, weekday };
}

async function weekContext(userId: number, tz: string, now: Date) {
  const { date: today } = localParts(now, tz);
  const days = weekDates(startOfWeek(today));
  const [weekItems, activity] = await Promise.all([
    getPlanItems(userId, days[0], days[6]),
    getActivitySummary(userId, tz),
  ]);
  return { today, days, weekItems, activity };
}

type Who = { userId: number; name: string; tz: string; now: Date };

async function composeDaily(
  who: Who,
  content: ReminderContent,
  force: boolean
): Promise<EmailContent | null> {
  const ctx = await weekContext(who.userId, who.tz, who.now);
  const items = ctx.weekItems.filter((i) => i.date === ctx.today);

  let nextStep: string | null = null;
  if (content !== "week" && items.length === 0) {
    const goals = await getUserGoals(who.userId);
    nextStep =
      goals
        .filter((g) => g.nextAction)
        .sort((a, b) => b.progress - a.progress)[0]?.nextAction?.title ?? null;
  }

  const weekTotal = ctx.weekItems.length;
  const hasContent =
    (content !== "week" && (items.length > 0 || nextStep)) ||
    (content !== "today" && weekTotal > 0);
  if (!hasContent && !force) return null; // never send an empty email

  return dailyEmail({
    name: who.name,
    content,
    items,
    nextStep,
    weekDone: ctx.weekItems.filter((i) => i.completed).length,
    weekTotal,
    streak: ctx.activity.streak,
    appUrl: appUrl(),
  });
}

async function composeWeekly(who: Who): Promise<EmailContent | null> {
  const ctx = await weekContext(who.userId, who.tz, who.now);
  const goals = (await getUserGoals(who.userId))
    .slice(0, 5)
    .map((g) => ({ title: g.title, progress: g.progress }));

  const thisWeek = ctx.activity.days.filter((d) => d.date >= ctx.days[0] && d.date <= ctx.today);
  const activities = thisWeek.reduce((sum, d) => sum + d.count, 0);
  const weekTotal = ctx.weekItems.length;

  if (activities === 0 && weekTotal === 0 && goals.length === 0) return null;

  return weeklyEmail({
    name: who.name,
    weekDone: ctx.weekItems.filter((i) => i.completed).length,
    weekTotal,
    activities,
    activeDays: thisWeek.filter((d) => d.count > 0).length,
    streak: ctx.activity.streak,
    goals,
    appUrl: appUrl(),
  });
}

/* ---------- the "send test email" button ---------- */

export async function sendReminderNow(userId: number, tz: string) {
  const [row] = await db
    .select({
      name: users.name,
      email: users.email,
      content: userSettings.reminderContent,
    })
    .from(users)
    .leftJoin(userSettings, eq(userSettings.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);
  if (!row) throw new Error("User not found");

  const content = await composeDaily(
    { userId, name: row.name, tz: safeZone(tz), now: new Date() },
    row.content ?? DEFAULT_PREFERENCES.reminderContent,
    true
  );
  if (!content) throw new Error("Nothing to send");
  await sendEmail({ to: row.email, ...content });
}

/* ---------- the hourly job ---------- */

type Field = "lastDailySentOn" | "lastWeeklySentOn";

// only one run can claim a given day, so overlapping runs never send twice
async function claim(userId: number, field: Field, date: string) {
  const column = userSettings[field];
  const patch = field === "lastDailySentOn" ? { lastDailySentOn: date } : { lastWeeklySentOn: date };

  const claimed = await db
    .update(userSettings)
    .set(patch)
    .where(and(eq(userSettings.userId, userId), or(isNull(column), ne(column, date))))
    .returning({ id: userSettings.userId });
  return claimed.length > 0;
}

async function release(userId: number, field: Field, previous: string | null) {
  const patch =
    field === "lastDailySentOn" ? { lastDailySentOn: previous } : { lastWeeklySentOn: previous };
  await db.update(userSettings).set(patch).where(eq(userSettings.userId, userId));
}

export async function runReminders(now = new Date()) {
  const rows = await db
    .select({
      userId: userSettings.userId,
      name: users.name,
      email: users.email,
      dailyReminder: userSettings.dailyReminder,
      reminderContent: userSettings.reminderContent,
      reminderHour: userSettings.reminderHour,
      weeklyDigest: userSettings.weeklyDigest,
      timezone: userSettings.timezone,
      lastDaily: userSettings.lastDailySentOn,
      lastWeekly: userSettings.lastWeeklySentOn,
    })
    .from(userSettings)
    .innerJoin(users, eq(users.id, userSettings.userId))
    .where(or(eq(userSettings.dailyReminder, true), eq(userSettings.weeklyDigest, true)));

  const result = { checked: rows.length, daily: 0, weekly: 0, failed: 0 };

  for (const s of rows) {
    const tz = safeZone(s.timezone);
    const { date, hour, weekday } = localParts(now, tz);

    // the chosen hour, plus 2 more in case a run was late or missed
    if (hour < s.reminderHour || hour >= s.reminderHour + 3) continue;

    const who: Who = { userId: s.userId, name: s.name, tz, now };

    async function deliver(kind: "daily" | "weekly") {
      const field: Field = kind === "daily" ? "lastDailySentOn" : "lastWeeklySentOn";
      const previous = kind === "daily" ? s.lastDaily : s.lastWeekly;
      if (!(await claim(s.userId, field, date))) return;

      try {
        const content =
          kind === "daily"
            ? await composeDaily(who, s.reminderContent, false)
            : await composeWeekly(who);
        if (content) {
          await sendEmail({ to: s.email, ...content });
          result[kind]++;
        }
      } catch (e) {
        await release(s.userId, field, previous); // try again on the next run
        result.failed++;
        console.error("Reminder failed", kind, s.userId, e instanceof Error ? e.message : "unknown");
      }
    }

    const isSunday = weekday === 0;

    if (s.weeklyDigest && isSunday && s.lastWeekly !== date) {
      await deliver("weekly");
    } else if (s.dailyReminder && !(s.weeklyDigest && isSunday) && s.lastDaily !== date) {
      await deliver("daily");
    }
  }

  return result;
}