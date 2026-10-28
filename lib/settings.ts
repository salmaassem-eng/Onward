export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value);
}

export function validateName(value: string) {
  const n = value.trim();
  if (n.length < 2) return "Name must be at least 2 characters.";
  if (n.length > 60) return "Keep your name under 60 characters.";
  return undefined;
}

export function validateNewPassword(pw: string) {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (new TextEncoder().encode(pw).length > 72) return "Password must be under 72 characters.";
  return undefined;
}