"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Trash2 } from "lucide-react";
import { PathProgressBar } from "@/components/paths/path-progress";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/states";
import { progressKey, toggleBookmark, useLibrary } from "@/lib/library/store";
import type { BookmarkType, LearningPath, SearchItem } from "@/types";

const groups: { type: BookmarkType; label: string }[] = [
  { type: "topic", label: "Topics" },
  { type: "path", label: "Learning paths" },
  { type: "project", label: "Projects" },
  { type: "resource", label: "Resources" },
];

/** Shows saved items and learning progress, from the browser or the user's account. */
export function LibraryView({
  items,
  paths,
}: {
  items: SearchItem[];
  paths: Pick<LearningPath, "slug" | "title" | "stages">[];
}) {
  const { ready, bookmarks, progress } = useLibrary();
  const byKey = new Map(items.map((item) => [item.id, item]));

  if (!ready) {
    return (
      <div className="space-y-3" role="status" aria-label="Loading your library">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    );
  }

  const saved = [...bookmarks].map((key) => byKey.get(key)).filter((item): item is SearchItem => Boolean(item));
  const inProgress = paths.filter((p) => p.stages.some((s) => progress.has(progressKey(p.slug, s.id))));

  return (
    <div className="space-y-14">
      <section aria-labelledby="progress-title">
        <h2 id="progress-title" className="mb-4 text-lg font-semibold text-foreground">
          Learning progress
        </h2>
        {inProgress.length === 0 ? (
          <EmptyState
            title="No learning paths started yet"
            description="Open a learning path and mark stages complete to track your progress here."
            action={<ButtonLink href="/learning-paths" variant="secondary">Browse learning paths</ButtonLink>}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {inProgress.map((path) => (
              <Link
                key={path.slug}
                href={`/learning-paths/${path.slug}`}
                className="group rounded-md border border-border bg-card p-5 hover:border-muted"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="font-medium text-foreground">{path.title}</span>
                  <ArrowRight className="size-4 text-accent transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </div>
                <PathProgressBar pathSlug={path.slug} stageIds={path.stages.map((s) => s.id)} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="saved-title">
        <h2 id="saved-title" className="mb-4 text-lg font-semibold text-foreground">
          Saved items <span className="font-mono text-sm font-normal text-muted">{saved.length}</span>
        </h2>
        {saved.length === 0 ? (
          <EmptyState
            title="Nothing saved yet"
            description="Use the bookmark icon on any topic, path, project or resource to save it here."
            action={<ButtonLink href="/explore" variant="secondary">Explore topics</ButtonLink>}
          />
        ) : (
          <div className="space-y-10">
            {groups.map(({ type, label }) => {
              const list = saved.filter((item) => item.type === type);
              if (!list.length) return null;
              return (
                <div key={type}>
                  <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.12em] text-muted">{label}</h3>
                  <ul className="divide-y divide-border rounded-md border border-border">
                    {list.map((item) => {
                      const itemId = item.id.slice(item.id.indexOf(":") + 1);
                      return (
                        <li key={item.id} className="flex items-center gap-3 p-4">
                          <div className="min-w-0 flex-1">
                            {item.external ? (
                              <a href={item.href} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:text-accent">
                                {item.title} <ArrowUpRight className="inline size-3.5" aria-hidden="true" />
                                <span className="sr-only">(opens in a new tab)</span>
                              </a>
                            ) : (
                              <Link href={item.href} className="font-medium text-foreground hover:text-accent">
                                {item.title}
                              </Link>
                            )}
                            <p className="mt-0.5 truncate text-xs text-muted">{item.meta}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => void toggleBookmark(type, itemId)}
                            className="flex size-8 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-foreground"
                            aria-label={`Remove “${item.title}” from your library`}
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
