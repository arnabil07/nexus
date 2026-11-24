"use client";

import { Bookmark, BookmarkCheck, X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  bookmarkKey,
  dismissLibraryError,
  initLibrary,
  toggleBookmark,
  useLibrary,
} from "@/lib/library/store";
import type { BookmarkType } from "@/types";

/** Starts the library store once. Rendered in the root layout. */
export function LibraryInit() {
  useEffect(() => {
    initLibrary();
  }, []);
  return null;
}

/** Small toast shown if saving a bookmark or progress fails. */
export function LibraryStatus() {
  const { error } = useLibrary();
  if (!error) return null;
  return (
    <div
      role="status"
      className="fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2.5rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-md border border-border bg-card px-4 py-3 text-sm text-foreground shadow-lg"
    >
      <span className="flex-1">{error}</span>
      <button
        type="button"
        onClick={dismissLibraryError}
        className="rounded-sm p-1 text-muted hover:text-foreground"
        aria-label="Dismiss message"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function BookmarkButton({
  type,
  id,
  title,
  variant = "icon",
  className,
}: {
  type: BookmarkType;
  id: string;
  title: string;
  variant?: "icon" | "full";
  className?: string;
}) {
  const { ready, bookmarks } = useLibrary();
  const saved = bookmarks.has(bookmarkKey(type, id));
  const Icon = saved ? BookmarkCheck : Bookmark;
  const label = saved ? `Remove “${title}” from your library` : `Save “${title}” to your library`;

  return (
    <button
      type="button"
      disabled={!ready}
      aria-pressed={saved}
      aria-label={variant === "icon" ? label : undefined}
      title={label}
      onClick={(event) => {
        // Bookmark buttons can sit inside clickable cards; don't trigger the card link.
        event.preventDefault();
        event.stopPropagation();
        void toggleBookmark(type, id);
      }}
      className={cn(
        "relative z-10 inline-flex items-center justify-center gap-2 rounded-md transition-colors disabled:opacity-50",
        variant === "icon"
          ? "size-8 text-muted hover:bg-surface hover:text-foreground"
          : "h-10 border border-border bg-card px-4 text-sm font-medium text-foreground hover:border-muted",
        saved && "text-accent hover:text-accent-hover",
        className,
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {variant === "full" && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
