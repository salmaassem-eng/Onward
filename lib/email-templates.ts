import type { ReminderContent } from "./settings";

export type EmailContent = { subject: string; html: string; text: string };

type Item = { title: string; completed: boolean; tag: string };

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ESCAPES[c]);

function shell(heading: string, body: string, appUrl: string) {
  return `<!doctype html><html><body style="margin:0;background:#f8f8f4;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#1c1917;">
<div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e7e5e4;border-radius:16px;padding:28px;">
<p style="margin:0 0 4px;font-size:13px;font-weight:bold;color:#16a34a;">ONWARD</p>
<h1 style="margin:0 0 16px;font-size:22px;">${esc(heading)}</h1>
${body}
<p style="margin:24px 0 0;"><a href="${esc(appUrl)}/dashboard" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:10px;">Open Onward</a></p>
</div>
<p style="max-width:520px;margin:16px auto 0;font-size:12px;color:#78716c;text-align:center;">You get this email because you turned on reminders. <a href="${esc(appUrl)}/settings" style="color:#78716c;">Change this in Settings</a>.</p>
</body></html>`;
}

const p = (text: string) => `<p style="margin:0 0 12px;line-height:1.5;">${esc(text)}</p>`;

function itemList(items: Item[]) {
  return `<ul style="margin:0 0 16px;padding:0;list-style:none;">${items
    .map(
      (i) =>
        `<li style="margin:8px 0;${i.completed ? "color:#a8a29e;text-decoration:line-through;" : ""}">${
          i.completed ? "&#10003;" : "&#9675;"
        } ${esc(i.title)} <span style="color:#a8a29e;text-decoration:none;">&middot; ${esc(i.tag)}</span></li>`
    )
    .join("")}</ul>`;
}

type DailyData = {
  name: string;
  content: ReminderContent;
  items: Item[];
  nextStep: string | null;
  weekDone: number;
  weekTotal: number;
  streak: number;
  appUrl: string;
};

export function dailyEmail(d: DailyData): EmailContent {
  const first = d.name.split(" ")[0];
  let html = p(`Good morning, ${first}.`);
  const text: string[] = [`Good morning, ${first}.`, ""];

  if (d.content !== "week") {
    if (d.items.length > 0) {
      html += p("Here is what you planned for today:") + itemList(d.items);
      text.push("Planned for today:");
      d.items.forEach((i) => text.push(`${i.completed ? "[x]" : "[ ]"} ${i.title} (${i.tag})`));
    } else if (d.nextStep) {
      html += p(`Nothing is planned for today. Your next step: ${d.nextStep}`);
      text.push(`Nothing is planned for today. Your next step: ${d.nextStep}`);
    } else {
      html += p("Nothing is planned for today yet.");
      text.push("Nothing is planned for today yet.");
    }
    text.push("");
  }

  if (d.content !== "today") {
    const line =
      d.weekTotal === 0
        ? "Nothing is planned this week yet."
        : `This week: ${d.weekDone} of ${d.weekTotal} done.`;
    html += p(line);
    text.push(line, "");
  }

  if (d.streak > 0) {
    const line = `Current streak: ${d.streak} ${d.streak === 1 ? "day" : "days"}.`;
    html += p(line);
    text.push(line, "");
  }

  text.push(`Open Onward: ${d.appUrl}/dashboard`);

  const n = d.items.length;
  return {
    subject:
      d.content !== "week" && n > 0
        ? `${n} ${n === 1 ? "task" : "tasks"} planned today`
        : "Your day on Onward",
    html: shell("Your day on Onward", html, d.appUrl),
    text: text.join("\n"),
  };
}

type WeeklyData = {
  name: string;
  weekDone: number;
  weekTotal: number;
  activities: number;
  activeDays: number;
  streak: number;
  goals: { title: string; progress: number }[];
  appUrl: string;
};

export function weeklyEmail(d: WeeklyData): EmailContent {
  const first = d.name.split(" ")[0];
  const stats = [
    `You finished ${d.activities} ${d.activities === 1 ? "step" : "steps"} on ${d.activeDays} ${
      d.activeDays === 1 ? "day" : "days"
    } this week.`,
    d.weekTotal > 0 ? `Planned tasks done: ${d.weekDone} of ${d.weekTotal}.` : "",
    d.streak > 0 ? `Current streak: ${d.streak} ${d.streak === 1 ? "day" : "days"}.` : "",
  ].filter(Boolean);

  let html = p(`Here is your week, ${first}.`) + stats.map(p).join("");
  const text = [`Here is your week, ${first}.`, "", ...stats, ""];

  if (d.goals.length > 0) {
    html += `<p style="margin:16px 0 8px;font-weight:bold;">Your goals</p><ul style="margin:0 0 16px;padding:0;list-style:none;">${d.goals
      .map((g) => `<li style="margin:6px 0;">${esc(g.title)} &mdash; <strong>${g.progress}%</strong></li>`)
      .join("")}</ul>`;
    text.push("Your goals:");
    d.goals.forEach((g) => text.push(`- ${g.title}: ${g.progress}%`));
    text.push("");
  }

  text.push(`Open Onward: ${d.appUrl}/dashboard`);

  return {
    subject: "Your week on Onward",
    html: shell("Your week on Onward", html, d.appUrl),
    text: text.join("\n"),
  };
}