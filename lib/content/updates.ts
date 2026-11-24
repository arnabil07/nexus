import { cache } from "react";
import { feedSources, FEED_REVALIDATE_SECONDS, type FeedSource } from "@/config/feeds";
import { siteConfig } from "@/config/site";
import { sampleUpdates } from "@/data/sample-updates";
import { feedsDisabled, shouldUseDatabaseContent } from "@/lib/env";
import { parseFeed } from "@/lib/feeds/parse";
import { hashString } from "@/lib/utils";
import type { TechUpdate, UpdatesResult } from "@/types";
import { loadDatabaseUpdates } from "./database";

/**
 * Tech updates come from (1) public RSS/Atom feeds and (2) optionally the
 * Supabase `tech_updates` table. Results are cached by Next.js and refreshed
 * every FEED_REVALIDATE_SECONDS. If no live item can be loaded, clearly
 * labelled sample items are returned instead and `mode` is "sample".
 */

async function fetchFeed(source: FeedSource): Promise<TechUpdate[]> {
  const response = await fetch(source.url, {
    headers: {
      "User-Agent": `NEXUS/1.0 (+${siteConfig.url})`,
      Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
    },
    next: { revalidate: FEED_REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`${source.name}: HTTP ${response.status}`);
  const xml = await response.text();
  return parseFeed(xml, source.limit ?? 6).map((item) => ({
    id: `${source.id}-${hashString(item.link)}`,
    title: item.title,
    summary: item.summary,
    category: source.category,
    source: source.name,
    publishedAt: item.publishedAt,
    url: item.link,
    isSample: false,
  }));
}

function byNewest(a: TechUpdate, b: TechUpdate): number {
  const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
  const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;
  return bTime - aTime;
}

export const getUpdates = cache(async (): Promise<UpdatesResult> => {
  if (feedsDisabled() && !shouldUseDatabaseContent()) {
    return { items: sampleUpdates, mode: "sample", failedSources: [] };
  }

  const failedSources: string[] = [];
  const tasks: Promise<TechUpdate[]>[] = [];

  if (!feedsDisabled()) {
    for (const source of feedSources) {
      tasks.push(
        fetchFeed(source).catch((error: unknown) => {
          failedSources.push(source.name);
          console.warn(`[updates] Feed failed: ${source.name}`, error instanceof Error ? error.message : error);
          return [];
        }),
      );
    }
  }
  if (shouldUseDatabaseContent()) {
    tasks.push(
      loadDatabaseUpdates().catch((error: unknown) => {
        failedSources.push("NEXUS database");
        console.warn("[updates] Database updates failed", error);
        return [];
      }),
    );
  }

  const results = await Promise.all(tasks);
  const seen = new Set<string>();
  const items = results
    .flat()
    .filter((item) => {
      const key = item.url ?? item.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort(byNewest);

  if (items.length === 0) {
    return { items: sampleUpdates, mode: "sample", failedSources };
  }
  return { items: items.slice(0, 120), mode: "live", failedSources };
});

export async function getUpdate(id: string): Promise<TechUpdate | null> {
  const { items } = await getUpdates();
  return items.find((item) => item.id === id) ?? null;
}
