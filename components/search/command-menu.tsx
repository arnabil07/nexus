"use client";

import { ArrowUpRight, CornerDownLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { OPEN_SEARCH_EVENT } from "@/components/navigation/nav-client";
import { mainNav } from "@/config/site";
import { searchItems, searchTypeLabel } from "@/lib/search";
import { cn } from "@/lib/utils";
import type { SearchItem } from "@/types";

const quickLinks: SearchItem[] = mainNav
  .filter((item) => item.href !== "/")
  .map((item) => ({
    id: `nav:${item.href}`,
    type: "topic",
    title: item.title,
    description: "",
    href: item.href,
    external: false,
    meta: "Go to page",
    keywords: [],
  }));

/**
 * Global search, opened with ⌘K / Ctrl+K or the search button.
 * Uses a native <dialog> for accessibility and the combobox/listbox pattern
 * so screen readers announce the highlighted result.
 */
export function CommandMenu({ index }: { index: SearchItem[] }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => (query.trim() ? searchItems(index, query, { limit: 24 }) : quickLinks), [index, query]);

  // Keyboard shortcut and custom "open search" event.
  useEffect(() => {
    const onShortcut = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onShortcut);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onShortcut);
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpen);
    };
  }, []);

  // Sync React state with the native dialog.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function go(item: SearchItem | undefined) {
    if (!item) return;
    setOpen(false);
    if (item.external) window.open(item.href, "_blank", "noopener,noreferrer");
    else router.push(item.href);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (results.length) go(results[active]);
      else if (query.trim()) {
        setOpen(false);
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  }

  // Group results by type while keeping one flat index for keyboard navigation.
  const grouped = useMemo(() => {
    const groups: { label: string; items: { item: SearchItem; index: number }[] }[] = [];
    results.forEach((item, i) => {
      const label = query.trim() ? searchTypeLabel[item.type] : "Pages";
      const group = groups.find((g) => g.label === label);
      if (group) group.items.push({ item, index: i });
      else groups.push({ label, items: [{ item, index: i }] });
    });
    return groups;
  }, [results, query]);

  const activeId = results[active] ? `${listId}-${active}` : undefined;

  return (
    <dialog
      ref={dialogRef}
      aria-label="Search NEXUS"
      onClose={() => setOpen(false)}
      onClick={(event) => {
        if (event.target === dialogRef.current) setOpen(false);
      }}
      className="mx-auto mt-[12vh] w-[min(40rem,calc(100%-2rem))] max-w-none rounded-lg border border-border bg-surface p-0 text-foreground shadow-2xl"
    >
      <div className="flex items-center gap-3 border-b border-border px-4">
        <Search className="size-4 text-muted" aria-hidden="true" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search topics, resources, paths, projects…"
          className="h-14 flex-1 bg-transparent text-[0.9375rem] text-foreground placeholder:text-muted focus:outline-none"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={activeId}
          aria-autocomplete="list"
          autoComplete="off"
          spellCheck={false}
        />
        <kbd className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[0.625rem] text-muted">ESC</kbd>
      </div>

      <div id={listId} role="listbox" aria-label="Search results" className="max-h-[min(60vh,28rem)] overflow-y-auto p-2">
        {results.length === 0 ? (
          <div className="px-3 py-10 text-center text-sm text-secondary">
            No results for “{query}”.
            <button
              type="button"
              className="mt-2 block w-full text-accent hover:text-accent-hover"
              onClick={() => {
                setOpen(false);
                router.push(`/search?q=${encodeURIComponent(query.trim())}`);
              }}
            >
              Search everything, including tech updates →
            </button>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.label} role="group" aria-label={group.label} className="mb-1">
              <p className="px-3 pb-1 pt-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted">
                {group.label}
              </p>
              {group.items.map(({ item, index: i }) => (
                <div
                  key={item.id}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(item)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5",
                    i === active ? "bg-card" : "hover:bg-card/60",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{item.title}</p>
                    <p className="truncate text-xs text-muted">{item.meta}</p>
                  </div>
                  {item.external ? (
                    <ArrowUpRight className="size-4 shrink-0 text-muted" aria-hidden="true" />
                  ) : (
                    i === active && <CornerDownLeft className="size-3.5 shrink-0 text-muted" aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-2.5 font-mono text-[0.6875rem] text-muted">
        <span>↑↓ navigate · ↵ open</span>
        {query.trim() && (
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            }}
            className="text-accent hover:text-accent-hover"
          >
            All results →
          </button>
        )}
      </div>
    </dialog>
  );
}
