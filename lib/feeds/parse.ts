/**
 * A small, dependency-free RSS 2.0 / Atom parser.
 * It extracts only what NEXUS needs (title, link, date, summary) and never
 * invents values: if a feed omits a date, the date stays null.
 */

export interface ParsedFeedItem {
  title: string;
  link: string;
  publishedAt: string | null;
  summary: string;
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  copy: "©",
  reg: "®",
  trade: "™",
};

export function decodeEntities(input: string): string {
  return input.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const code = entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

function stripCdata(value: string): string {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
}

/** Converts an HTML fragment to clean plain text. */
export function htmlToText(html: string): string {
  // Feeds often double-encode HTML (&lt;p&gt;), so decode first, then strip tags, then decode again.
  const decoded = decodeEntities(stripCdata(html));
  const noTags = decoded
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  return decodeEntities(noTags).replace(/\s+/g, " ").trim();
}

function firstTag(block: string, tags: string[]): string | null {
  for (const tag of tags) {
    const escaped = tag.replace(":", "\\:");
    const match = block.match(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)</${escaped}>`, "i"));
    if (match && match[1].trim()) return match[1];
  }
  return null;
}

function atomLink(block: string): string | null {
  const links = block.match(/<link\b[^>]*>/gi) ?? [];
  let fallback: string | null = null;
  for (const tag of links) {
    const href = tag.match(/href\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!href) continue;
    const rel = tag.match(/rel\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!rel || rel === "alternate") return href;
    fallback ??= href;
  }
  return fallback;
}

function toIsoDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(htmlToText(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ") > max * 0.6 ? cut.lastIndexOf(" ") : max).trimEnd()}…`;
}

export function parseFeed(xml: string, limit = 10): ParsedFeedItem[] {
  const isAtom = /<feed[\s>]/i.test(xml) && !/<rss[\s>]/i.test(xml);
  const blocks = xml.match(isAtom ? /<entry\b[\s\S]*?<\/entry>/gi : /<item\b[\s\S]*?<\/item>/gi) ?? [];
  const items: ParsedFeedItem[] = [];

  for (const block of blocks) {
    const rawTitle = firstTag(block, ["title"]);
    const title = rawTitle ? htmlToText(rawTitle) : "";

    let link = isAtom ? atomLink(block) : firstTag(block, ["link"]);
    if (!link && !isAtom) link = atomLink(block); // some RSS feeds use <atom:link>
    if (!link) {
      const guid = firstTag(block, ["guid"]);
      if (guid && isHttpUrl(htmlToText(guid))) link = guid;
    }
    link = link ? htmlToText(link) : "";

    const publishedAt = toIsoDate(firstTag(block, ["pubDate", "published", "updated", "dc:date"]));
    const rawSummary = firstTag(block, ["description", "summary", "content:encoded", "content"]);
    const summary = rawSummary ? truncate(htmlToText(rawSummary), 260) : "";

    if (!title || !isHttpUrl(link)) continue;
    items.push({ title, link, publishedAt, summary });
    if (items.length >= limit) break;
  }
  return items;
}
