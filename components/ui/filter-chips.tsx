"use client";

import { cn } from "@/lib/utils";

/** A row of toggle chips for single-choice filters (e.g. difficulty). */
export function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-sm transition-colors",
              active
                ? "border-accent bg-accent text-on-accent"
                : "border-border bg-surface text-secondary hover:border-muted hover:text-foreground",
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={cn("font-mono text-xs", active ? "text-on-accent/70" : "text-muted")}>{option.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
