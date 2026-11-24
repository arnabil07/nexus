"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { TopicCard } from "@/components/cards/cards";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { normalise } from "@/lib/search";
import { cn } from "@/lib/utils";
import type { Category, CategorySlug, Topic } from "@/types";

/**
 * Topic search + category filter. The current filter is kept in the URL
 * (?q=…&category=…) so filtered views can be bookmarked and shared.
 */
export function ExploreBrowser({ topics, categories }: { topics: Topic[]; categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const initialCategory = params.get("category");
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState<CategorySlug | "all">(
    categories.some((c) => c.slug === initialCategory) ? (initialCategory as CategorySlug) : "all",
  );
  const [beginnerOnly, setBeginnerOnly] = useState(params.get("beginner") === "1");

  function updateUrl(next: { q?: string; category?: string; beginner?: boolean }) {
    const search = new URLSearchParams();
    const q = next.q ?? query;
    const c = next.category ?? category;
    const b = next.beginner ?? beginnerOnly;
    if (q.trim()) search.set("q", q.trim());
    if (c !== "all") search.set("category", c);
    if (b) search.set("beginner", "1");
    const qs = search.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const filtered = useMemo(() => {
    const tokens = normalise(query).split(" ").filter(Boolean);
    return topics.filter((topic) => {
      if (category !== "all" && topic.category !== category) return false;
      if (beginnerOnly && !topic.beginnerFriendly) return false;
      if (!tokens.length) return true;
      const haystack = normalise(
        `${topic.title} ${topic.summary} ${topic.coreConcepts.map((c) => c.title).join(" ")}`,
      );
      return tokens.every((token) => haystack.includes(token));
    });
  }, [topics, query, category, beginnerOnly]);

  const visibleCategories = categories.filter((c) => filtered.some((t) => t.category === c.slug));
  const isFiltering = query.trim() !== "" || category !== "all" || beginnerOnly;

  function reset() {
    setQuery("");
    setCategory("all");
    setBeginnerOnly(false);
    router.replace(pathname, { scroll: false });
  }

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="relative max-w-xl">
          <label htmlFor="topic-search" className="sr-only">
            Search topics
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            id="topic-search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              updateUrl({ q: event.target.value });
            }}
            placeholder="Search topics…"
            className="h-11 w-full rounded-md border border-border bg-surface pl-10 pr-3 text-sm text-foreground placeholder:text-muted focus:border-muted focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
          {[{ slug: "all" as const, title: "All" }, ...categories].map((c) => {
            const active = category === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setCategory(c.slug);
                  updateUrl({ category: c.slug });
                }}
                className={cn(
                  "h-8 rounded-md border px-3 text-sm transition-colors",
                  active
                    ? "border-accent bg-accent text-on-accent"
                    : "border-border bg-surface text-secondary hover:border-muted hover:text-foreground",
                )}
              >
                {c.title}
              </button>
            );
          })}
          <label className="ml-1 inline-flex cursor-pointer items-center gap-2 text-sm text-secondary">
            <input
              type="checkbox"
              checked={beginnerOnly}
              onChange={(event) => {
                setBeginnerOnly(event.target.checked);
                updateUrl({ beginner: event.target.checked });
              }}
              className="size-4 accent-[var(--color-accent)]"
            />
            Beginner friendly only
          </label>
        </div>
      </div>

      <p className="mt-6 font-mono text-xs text-muted" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "topic" : "topics"}
        {isFiltering && " match your filters"}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="No topics match your search"
          description="Try a different word, or clear the filters to see every topic."
          action={
            <Button variant="secondary" onClick={reset}>
              <X aria-hidden="true" /> Clear filters
            </Button>
          }
        />
      ) : (
        <div className="mt-6 space-y-12">
          {visibleCategories.map((c) => (
            <section key={c.slug} aria-labelledby={`cat-${c.slug}`}>
              <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-border pb-3">
                <h2 id={`cat-${c.slug}`} className="text-lg font-semibold text-foreground">
                  {c.title}
                </h2>
                <p className="hidden text-sm text-muted sm:block">{c.description}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered
                  .filter((t) => t.category === c.slug)
                  .map((topic) => (
                    <TopicCard key={topic.slug} topic={topic} />
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
