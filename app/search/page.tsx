import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Search } from "lucide-react";
import { Container, PageHeader } from "@/components/layout/container";
import { EmptyState } from "@/components/ui/states";
import { buildSearchIndex, getPopularTopics } from "@/lib/content";
import { searchItems, searchTypeLabel } from "@/lib/search";
import { cn } from "@/lib/utils";
import type { SearchItemType } from "@/types";

export const metadata: Metadata = {
  title: "Search",
  description: "Search NEXUS topics, learning paths, projects, resources and tech updates.",
  robots: { index: false, follow: true },
};

const types: SearchItemType[] = ["topic", "path", "project", "resource", "update"];

type Props = { searchParams: Promise<{ q?: string | string[]; type?: string | string[] }> };

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = (Array.isArray(params.q) ? params.q[0] : params.q)?.slice(0, 200) ?? "";
  const rawType = Array.isArray(params.type) ? params.type[0] : params.type;
  const type = types.includes(rawType as SearchItemType) ? (rawType as SearchItemType) : undefined;

  const index = await buildSearchIndex({ includeUpdates: true });
  const allResults = query ? searchItems(index, query, { limit: 200 }) : [];
  const results = type ? allResults.filter((r) => r.type === type) : allResults;
  const popular = query ? [] : await getPopularTopics(8);

  const href = (t?: SearchItemType) => `/search?q=${encodeURIComponent(query)}${t ? `&type=${t}` : ""}`;

  return (
    <>
      <PageHeader eyebrow="Search" title={query ? `Results for “${query}”` : "Search NEXUS"}>
        <form action="/search" method="get" role="search" className="flex max-w-2xl gap-2">
          <label htmlFor="search-page-input" className="sr-only">
            Search
          </label>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              id="search-page-input"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search topics, resources, paths, projects, updates…"
              className="h-11 w-full rounded-md border border-border bg-surface pl-10 pr-3 text-sm text-foreground placeholder:text-muted focus:border-muted focus:outline-none"
            />
          </div>
          {type && <input type="hidden" name="type" value={type} />}
          <button type="submit" className="h-11 rounded-md bg-accent px-5 text-sm font-medium text-on-accent hover:bg-accent-hover">
            Search
          </button>
        </form>
      </PageHeader>

      <Container className="py-10">
        {!query ? (
          <div>
            <p className="mb-4 text-secondary">Try one of these popular topics:</p>
            <div className="flex flex-wrap gap-2">
              {popular.map((t) => (
                <Link
                  key={t.slug}
                  href={`/topics/${t.slug}`}
                  className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-secondary hover:border-muted hover:text-foreground"
                >
                  {t.title}
                </Link>
              ))}
            </div>
            <p className="mt-8 text-sm text-muted">
              Tip: press <kbd className="rounded-sm border border-border px-1.5 font-mono text-xs">⌘K</kbd> or{" "}
              <kbd className="rounded-sm border border-border px-1.5 font-mono text-xs">Ctrl K</kbd> anywhere to search.
            </p>
          </div>
        ) : (
          <>
            <nav aria-label="Filter results by type" className="mb-8 flex flex-wrap gap-2">
              {[undefined, ...types].map((t) => {
                const count = t ? allResults.filter((r) => r.type === t).length : allResults.length;
                const active = t === type;
                return (
                  <Link
                    key={t ?? "all"}
                    href={href(t)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-sm",
                      active
                        ? "border-accent bg-accent text-on-accent"
                        : "border-border bg-surface text-secondary hover:border-muted hover:text-foreground",
                    )}
                  >
                    {t ? searchTypeLabel[t] : "All"}
                    <span className={cn("font-mono text-xs", active ? "text-on-accent/70" : "text-muted")}>{count}</span>
                  </Link>
                );
              })}
            </nav>

            {results.length === 0 ? (
              <EmptyState
                title={`No results for “${query}”`}
                description="Check the spelling, try a more general word, or browse topics instead."
                action={
                  <Link href="/explore" className="text-sm text-accent hover:text-accent-hover">
                    Browse all topics →
                  </Link>
                }
              />
            ) : (
              <ul className="divide-y divide-border rounded-md border border-border">
                {results.map((item) => (
                  <li key={item.id}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-4 p-4 hover:bg-surface"
                      >
                        <ResultBody title={item.title} meta={item.meta} description={item.description} />
                        <ArrowUpRight className="mt-1 size-4 shrink-0 text-accent" aria-hidden="true" />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    ) : (
                      <Link href={item.href} className="group flex items-start gap-4 p-4 hover:bg-surface">
                        <ResultBody title={item.title} meta={item.meta} description={item.description} />
                        <ArrowRight className="mt-1 size-4 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Container>
    </>
  );
}

function ResultBody({ title, meta, description }: { title: string; meta: string; description: string }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-muted">{meta}</p>
      <p className="mt-1 font-medium text-foreground group-hover:text-accent">{title}</p>
      {description && <p className="mt-1 line-clamp-2 text-sm text-secondary">{description}</p>}
    </div>
  );
}
