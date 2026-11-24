import type { SearchItem, SearchItemType } from "@/types";

/**
 * Client-safe search used by both the ⌘K menu and the /search page.
 * Every word in the query must appear somewhere in the item. Matches in the
 * title score highest, then keywords, then the description.
 */

export function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(query: string): string[] {
  return normalise(query).split(" ").filter(Boolean);
}

function scoreItem(item: SearchItem, tokens: string[], phrase: string): number {
  const title = normalise(item.title);
  const keywords = normalise(item.keywords.join(" "));
  const description = normalise(`${item.description} ${item.meta}`);
  let score = 0;

  for (const token of tokens) {
    let tokenScore = 0;
    if (title.split(" ").some((word) => word.startsWith(token))) tokenScore = 6;
    else if (title.includes(token)) tokenScore = 4;
    else if (keywords.includes(token)) tokenScore = 3;
    else if (description.includes(token)) tokenScore = 1;
    if (tokenScore === 0) return 0; // every token must match
    score += tokenScore;
  }
  if (title === phrase) score += 20;
  else if (title.startsWith(phrase)) score += 10;
  else if (title.includes(phrase)) score += 5;
  return score;
}

const typeWeight: Record<SearchItemType, number> = {
  topic: 3,
  path: 2,
  project: 1.5,
  resource: 1,
  update: 0.5,
};

export function searchItems(
  items: SearchItem[],
  query: string,
  options: { types?: SearchItemType[]; limit?: number } = {},
): SearchItem[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];
  const phrase = tokens.join(" ");
  const allowed = options.types?.length ? new Set(options.types) : null;

  return items
    .filter((item) => !allowed || allowed.has(item.type))
    .map((item) => ({ item, score: scoreItem(item, tokens, phrase) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score * typeWeight[b.item.type] - a.score * typeWeight[a.item.type])
    .slice(0, options.limit ?? 50)
    .map(({ item }) => item);
}

export const searchTypeLabel: Record<SearchItemType, string> = {
  topic: "Topics",
  path: "Learning paths",
  project: "Projects",
  resource: "Resources",
  update: "Tech updates",
};
