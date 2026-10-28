"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { sendTestEmail, updatePreferences } from "@/app/actions/settings";
import {
  REMINDER_HOURS,
  hourLabel,
  type Preferences,
  type ReminderContent,
} from "@/lib/settings";

type NotificationPrefs = Pick<
  Preferences,
  "dailyReminder" | "reminderContent" | "reminderHour" | "weeklyDigest"
>;

const contentOptions: { value: ReminderContent; label: string; hint: string }[] = [
  { value: "today", label: "Today's list", hint: "What you planned for today" },
  { value: "week", label: "Week progress", hint: "How your week is going" },
  { value: "both", label: "Both", hint: "Today's list and the week" },
];

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
        checked ? "bg-green-500" : "bg-stone-300"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-[#ffffff] shadow transition-all ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

export default function NotificationsCard({
  email,
  initial,
}: {
  email: string;
  initial: NotificationPrefs;
}) {
  const [prefs, setPrefs] = useState(initial);
  const [testing, setTesting] = useState(false);

  async function save(patch: Partial<NotificationPrefs>) {
    const before = prefs;
    setPrefs({ ...prefs, ...patch });

    try {
      const result = await updatePreferences(patch);
      if (!result.ok) {
        setPrefs(before);
        toast.error(result.message ?? "Couldn't save that.");
        return;
      }
      toast.success("Saved.");
    } catch {
      setPrefs(before);
      toast.error("Couldn't save that. Please try again.");
    }
  }

  async function test() {
    setTesting(true);
    try {
      const result = await sendTestEmail();
      if (result.ok) toast.success(`Test email sent to ${email}.`);
      else toast.error(result.message ?? "Couldn't send the email.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setTesting(false);
    }
  }

  const anyOn = prefs.dailyReminder || prefs.weeklyDigest;

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
      <h2 className="font-heading text-lg font-semibold text-stone-900">Notifications</h2>
      <p className="mt-1 text-sm text-stone-400">Choose how Onward keeps you on track</p>

      <div className="mt-6 space-y-6">
        <div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-stone-900">Daily reminders</p>
              <p className="text-sm text-stone-400">
                Get a gentle email to check in with your goals
              </p>
            </div>
            <Switch
              checked={prefs.dailyReminder}
              label="Daily reminders"
              onChange={(value) => save({ dailyReminder: value })}
            />
          </div>

          {prefs.dailyReminder && (
            <div className="mt-4 space-y-4 rounded-2xl bg-stone-50 p-4">
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-stone-700">
                  What should it include?
                </legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {contentOptions.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      aria-pressed={prefs.reminderContent === o.value}
                      onClick={() => save({ reminderContent: o.value })}
                      className={`rounded-xl border px-3 py-2.5 text-left transition ${
                        prefs.reminderContent === o.value
                          ? "border-green-500 bg-green-50"
                          : "border-stone-200 bg-white hover:bg-stone-50"
                      }`}
                    >
                      <span className="block text-sm font-semibold text-stone-900">
                        {o.label}
                      </span>
                      <span className="block text-xs text-stone-400">{o.hint}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <div>
                <label
                  htmlFor="reminder-hour"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Send it at (your local time)
                </label>
                <select
                  id="reminder-hour"
                  value={prefs.reminderHour}
                  onChange={(e) => save({ reminderHour: Number(e.target.value) })}
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/40 sm:w-48"
                >
                  {REMINDER_HOURS.map((h) => (
                    <option key={h} value={h}>
                      {hourLabel(h)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-stone-900">Weekly digest</p>
            <p className="text-sm text-stone-400">
              A summary of your progress every Sunday
            </p>
          </div>
          <Switch
            checked={prefs.weeklyDigest}
            label="Weekly digest"
            onChange={(value) => save({ weeklyDigest: value })}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-5">
        <p className="text-sm text-stone-400">
          {anyOn ? `Emails go to ${email}.` : "No emails will be sent."}
        </p>
        <button
          type="button"
          onClick={test}
          disabled={testing}
          className="text-sm font-semibold text-green-600 hover:underline disabled:opacity-50"
        >
          {testing ? "Sending..." : "Send me a test email"}
        </button>
      </div>
    </section>
  );
}