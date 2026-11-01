import "server-only";

// the public address of the site (used for links and the Google redirect)
export function getAppUrl() {
  const url = process.env.APP_URL?.replace(/\/$/, "");
  if (url) return url;
  return process.env.NODE_ENV === "production" ? null : "http://localhost:3000";
}