import "server-only";
import dns from "node:dns/promises";
import net from "node:net";
import {
  MAX_IMPORTED_LESSONS,
  PROVIDER_LABELS,
  cleanUrlOrNull,
  detectProvider,
  type CourseProvider,
  type ImportResult,
  type ImportedLesson,
} from "./learning";

/* ====================== safe fetching ====================== */

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    );
  }
  const v = ip.toLowerCase();
  if (v === "::1" || v === "::") return true;
  if (/^f[cd]/.test(v) || /^fe[89ab]/.test(v)) return true;
  if (v.startsWith("::ffff:")) {
    const rest = v.slice(7);
    return rest.includes(".") ? isPrivateIp(rest) : true;
  }
  return false;
}

async function assertPublicUrl(raw: string) {
  const u = new URL(raw);
  if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error("Blocked protocol");
  if (u.port && u.port !== "80" && u.port !== "443") throw new Error("Blocked port");
  if (u.username || u.password) throw new Error("Blocked credentials");

  const host = u.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    throw new Error("Blocked host");
  }

  const addresses = net.isIP(host)
    ? [host]
    : (await dns.lookup(host, { all: true })).map((a) => a.address);
  if (addresses.length === 0 || addresses.some(isPrivateIp)) {
    throw new Error("Blocked address");
  }
}

async function readLimited(res: Response, max: number) {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.length;
    if (size >= max) {
      await reader.cancel();
      break;
    }
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function safeFetchHtml(startUrl: string): Promise<string> {
  let current = startUrl;

  for (let hop = 0; hop < 4; hop++) {
    await assertPublicUrl(current);

    const res = await fetch(current, {
      redirect: "manual", // every redirect is checked again
      cache: "no-store",
      signal: AbortSignal.timeout(7000),
      headers: {
        "User-Agent": "OnwardBot/1.0 (course link preview)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      await res.body?.cancel();
      if (!location) throw new Error("Bad redirect");
      current = new URL(location, current).toString();
      continue;
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("text/html") && !type.includes("application/xhtml")) {
      throw new Error("Not a web page");
    }
    return readLimited(res, 1_000_000);
  }
  throw new Error("Too many redirects");
}

/* ====================== reading page metadata ====================== */

function decode(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&#x27;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function metaContent(html: string, key: string) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attrs: Record<string, string> = {};
    for (const m of tag.matchAll(/([a-zA-Z:_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
      attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? "";
    }
    const matches = [attrs.property, attrs.name].some((v) => v?.toLowerCase() === key);
    if (matches && attrs.content) return decode(attrs.content);
  }
  return null;
}

function titleTag(html: string) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? decode(m[1]) : null;
}

type CourseLd = { name?: string; image?: string };

function walkLd(node: unknown): CourseLd | null {
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = walkLd(item);
      if (found) return found;
    }
    return null;
  }
  if (!node || typeof node !== "object") return null;

  const o = node as Record<string, unknown>;
  const types = Array.isArray(o["@type"]) ? o["@type"] : [o["@type"]];

  if (types.includes("Course")) {
    const img = o.image;
    const image =
      typeof img === "string"
        ? img
        : Array.isArray(img) && typeof img[0] === "string"
        ? img[0]
        : img && typeof img === "object" && typeof (img as { url?: unknown }).url === "string"
        ? (img as { url: string }).url
        : undefined;
    return { name: typeof o.name === "string" ? o.name : undefined, image };
  }
  return o["@graph"] ? walkLd(o["@graph"]) : null;
}

function findCourseJsonLd(html: string): CourseLd | null {
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const m of html.matchAll(re)) {
    try {
      const found = walkLd(JSON.parse(m[1]));
      if (found) return found;
    } catch {
      // not valid JSON, try the next block
    }
  }
  return null;
}

const clip = (s: string) => s.trim().slice(0, 100);

function cleanTitle(raw: string | null | undefined) {
  if (!raw) return null;
  const t = decode(raw)
    .replace(/\s+/g, " ")
    .replace(/\s*[|\-–—]\s*(Coursera|Udemy)\s*$/i, "")
    .trim();
  return t.length >= 2 ? clip(t) : null;
}

function titleFromSlug(u: URL) {
  const slug = u.pathname.split("/").filter(Boolean).pop();
  if (!slug) return null;
  let text = slug;
  try {
    text = decodeURIComponent(slug);
  } catch {
    // keep it as it is
  }
  const words = text.replace(/\.[a-z]+$/i, "").split(/[-_]+/).filter(Boolean);
  if (words.length === 0) return null;
  return clip(words.map((w) => w[0].toUpperCase() + w.slice(1)).join(" "));
}

const httpsOrNull = (v: string | null | undefined, base?: string) => {
  if (!v) return null;
  try {
    return cleanUrlOrNull(new URL(v, base).toString(), true);
  } catch {
    return null;
  }
};

/* ====================== generic pages (Udemy, Coursera, others) ====================== */

async function importPage(u: URL, url: string, provider: CourseProvider): Promise<ImportResult> {
  let html: string | null = null;
  try {
    html = await safeFetchHtml(url);
  } catch {
    html = null;
  }

  let title: string | null = null;
  let image: string | null = null;

  if (html) {
    const ld = findCourseJsonLd(html);
    title = cleanTitle(
      ld?.name ?? metaContent(html, "og:title") ?? metaContent(html, "twitter:title") ?? titleTag(html)
    );
    image = httpsOrNull(
      ld?.image ?? metaContent(html, "og:image") ?? metaContent(html, "twitter:image"),
      url
    );
  }

  const fromPage = Boolean(title);
  title = title ?? titleFromSlug(u);

  const noLessons =
    provider === "other"
      ? "We couldn't find a lesson list on this page, so add the lessons below or paste them as a list."
      : `${PROVIDER_LABELS[provider]} doesn't share its lesson list, so add the lessons below or paste them as a list.`;

  const notice = !html
    ? `That site didn't let us read the page, so the title comes from the link. Check it. ${noLessons}`
    : !fromPage
    ? `We couldn't read a title from the page, so it comes from the link. Check it. ${noLessons}`
    : `Got the course details. ${noLessons}`;

  return {
    ok: true,
    found: 0,
    notice,
    course: { url, provider, title: title ?? "", thumbnailUrl: image, modules: [] },
  };
}

/* ====================== YouTube ====================== */

class NotFoundError extends Error {}

type Thumbs = Record<string, { url: string } | undefined>;

function pickThumb(t?: Thumbs) {
  const best = t?.maxres ?? t?.standard ?? t?.high ?? t?.medium ?? t?.default;
  return httpsOrNull(best?.url);
}

function parseYoutube(u: URL): { playlistId?: string; videoId?: string } | null {
  const host = u.hostname.toLowerCase().replace(/^www\./, "");
  let videoId: string | undefined;
  const playlistId = u.searchParams.get("list") ?? undefined;

  if (host === "youtu.be") {
    videoId = u.pathname.slice(1).split("/")[0];
  } else {
    videoId = u.searchParams.get("v") ?? undefined;
    const m = u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/);
    if (!videoId && m) videoId = m[1];
  }

  if (playlistId && /^[\w-]{10,64}$/.test(playlistId)) return { playlistId, videoId };
  if (videoId && /^[\w-]{11}$/.test(videoId)) return { videoId };
  return null;
}

async function ytJson<T>(path: string, params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams({ ...params, key: process.env.YOUTUBE_API_KEY ?? "" });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/${path}?${qs}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (res.status === 404) throw new NotFoundError();
  if (!res.ok) throw new Error(`YouTube API ${res.status}`);
  return res.json() as Promise<T>;
}

async function youtubePlaylist(id: string, url: string): Promise<ImportResult> {
  const meta = await ytJson<{ items?: { snippet: { title: string; thumbnails?: Thumbs } }[] }>(
    "playlists",
    { part: "snippet", id }
  );
  const info = meta.items?.[0];
  if (!info) throw new NotFoundError();

  type Page = {
    nextPageToken?: string;
    items?: { snippet: { title: string; resourceId?: { videoId?: string } } }[];
  };

  const lessons: ImportedLesson[] = [];
  let pageToken: string | undefined;

  for (let page = 0; page < 4; page++) {
    const data = await ytJson<Page>("playlistItems", {
      part: "snippet",
      playlistId: id,
      maxResults: "50",
      ...(pageToken ? { pageToken } : {}),
    });

    for (const item of data.items ?? []) {
      const title = item.snippet.title;
      const videoId = item.snippet.resourceId?.videoId;
      if (!videoId || title === "Private video" || title === "Deleted video") continue;
      lessons.push({ title: clip(title), url: `https://www.youtube.com/watch?v=${videoId}&list=${id}` });
    }

    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }

  const capped = lessons.slice(0, MAX_IMPORTED_LESSONS);
  const more = Boolean(pageToken) || lessons.length > capped.length;
  const count = capped.length;

  return {
    ok: true,
    found: count,
    notice:
      count === 0
        ? "That playlist has no public videos. Add the lessons yourself below."
        : `Found ${count} ${count === 1 ? "video" : "videos"} in this playlist. Review them below, then save.${
            more ? ` Only the first ${MAX_IMPORTED_LESSONS} were imported.` : ""
          }`,
    course: {
      url,
      provider: "youtube",
      title: clip(info.snippet.title),
      thumbnailUrl: pickThumb(info.snippet.thumbnails),
      modules: count > 0 ? [{ title: "Lessons", lessons: capped }] : [],
    },
  };
}

function parseChapters(description: string, videoId: string): ImportedLesson[] {
  const found: { seconds: number; title: string }[] = [];

  for (const line of description.split(/\r?\n/)) {
    const m = line.match(/^\s*(?:[-•*]\s*)?\(?((?:\d{1,2}:)?\d{1,2}:\d{2})\)?\s*[-–—:.]?\s*(.+)$/);
    if (!m) continue;
    const parts = m[1].split(":").map(Number);
    const seconds = parts.reduce((acc, n) => acc * 60 + n, 0);
    found.push({ seconds, title: clip(m[2]) });
  }

  // YouTube only counts chapters when there are 3+ and the first starts at 0:00
  const valid =
    found.length >= 3 &&
    found[0].seconds === 0 &&
    found.every((c, i) => i === 0 || c.seconds > found[i - 1].seconds);
  if (!valid) return [];

  return found.map((c) => ({
    title: c.title,
    url: `https://www.youtube.com/watch?v=${videoId}&t=${c.seconds}s`,
  }));
}

async function youtubeVideo(videoId: string, url: string): Promise<ImportResult> {
  const data = await ytJson<{
    items?: { snippet: { title: string; description?: string; thumbnails?: Thumbs } }[];
  }>("videos", { part: "snippet", id: videoId });

  const info = data.items?.[0];
  if (!info) throw new NotFoundError();

  const title = clip(info.snippet.title);
  const chapters = parseChapters(info.snippet.description ?? "", videoId);
  const watch = `https://www.youtube.com/watch?v=${videoId}`;

  return {
    ok: true,
    found: chapters.length || 1,
    notice:
      chapters.length > 0
        ? `Found ${chapters.length} chapters in this video. Review them below, then save.`
        : "This video has no chapters, so it is one lesson. Add more lessons if you want to split it.",
    course: {
      url,
      provider: "youtube",
      title,
      thumbnailUrl: pickThumb(info.snippet.thumbnails),
      modules: [
        {
          title: chapters.length > 0 ? "Chapters" : "Lessons",
          lessons: chapters.length > 0 ? chapters : [{ title, url: watch }],
        },
      ],
    },
  };
}

// no API key (or the API failed): title and image only
async function youtubeBasic(
  url: string,
  ref: { playlistId?: string; videoId?: string }
): Promise<ImportResult> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`,
      { cache: "no-store", signal: AbortSignal.timeout(6000) }
    );
    if (res.ok) {
      const json = (await res.json()) as { title?: string; thumbnail_url?: string };
      if (json.title) {
        const title = clip(json.title);
        const single = ref.videoId && !ref.playlistId;
        return {
          ok: true,
          found: single ? 1 : 0,
          notice: single
            ? "Got the video details. It is one lesson for now."
            : "Got the title and image, but the lessons can't be fetched right now. Add them below or paste them as a list.",
          course: {
            url,
            provider: "youtube",
            title,
            thumbnailUrl: httpsOrNull(json.thumbnail_url),
            modules: single ? [{ title: "Lessons", lessons: [{ title, url }] }] : [],
          },
        };
      }
    }
  } catch {
    // fall through to the message below
  }
  return {
    ok: false,
    message: "We couldn't read that YouTube link. Check that it is public, or add the course by hand.",
  };
}

async function importYoutube(u: URL, url: string): Promise<ImportResult> {
  const ref = parseYoutube(u);
  if (!ref) {
    return { ok: false, message: "That YouTube link doesn't point to a video or a playlist." };
  }

  if (!process.env.YOUTUBE_API_KEY) {
    console.warn("YOUTUBE_API_KEY is not set: importing the title only.");
    return youtubeBasic(url, ref);
  }

  try {
    return ref.playlistId
      ? await youtubePlaylist(ref.playlistId, url)
      : await youtubeVideo(ref.videoId!, url);
  } catch (e) {
    if (e instanceof NotFoundError) {
      return {
        ok: false,
        message:
          "We couldn't find that video or playlist. It may be private, or an auto-generated mix.",
      };
    }
    console.error("YouTube import failed:", e instanceof Error ? e.message : "unknown error");
    return youtubeBasic(url, ref);
  }
}

/* ====================== entry point ====================== */

export async function importFromUrl(url: string): Promise<ImportResult> {
  const parsed = new URL(url);
  const provider = detectProvider(url) ?? "other";
  return provider === "youtube" ? importYoutube(parsed, url) : importPage(parsed, url, provider);
}