"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { progressKey, toggleStage, useLibrary } from "@/lib/library/store";

/** Progress bar for one learning path, based on completed stages. */
export function PathProgressBar({
  pathSlug,
  stageIds,
  className,
}: {
  pathSlug: string;
  stageIds: string[];
  className?: string;
}) {
  const { progress, ready } = useLibrary();
  const done = stageIds.filter((id) => progress.has(progressKey(pathSlug, id))).length;
  const percent = stageIds.length ? Math.round((done / stageIds.length) * 100) : 0;

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between font-mono text-xs text-muted">
        <span>Your progress</span>
        <span aria-live="polite">{ready ? `${done}/${stageIds.length} stages · ${percent}%` : "Loading…"}</span>
      </div>
      <div
        role="progressbar"
        aria-label="Learning path progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-1.5 overflow-hidden rounded-full bg-card"
      >
        <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

/** "Mark as complete" toggle for a single stage. */
export function StageToggle({ pathSlug, stageId, title }: { pathSlug: string; stageId: string; title: string }) {
  const { progress, ready } = useLibrary();
  const done = progress.has(progressKey(pathSlug, stageId));

  return (
    <button
      type="button"
      disabled={!ready}
      aria-pressed={done}
      onClick={() => void toggleStage(pathSlug, stageId)}
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors disabled:opacity-50",
        done
          ? "border-accent/40 bg-accent/10 text-accent hover:border-accent"
          : "border-border text-secondary hover:border-muted hover:text-foreground",
      )}
    >
      <span
        className={cn(
          "flex size-4 items-center justify-center rounded-sm border",
          done ? "border-accent bg-accent text-on-accent" : "border-muted",
        )}
        aria-hidden="true"
      >
        {done && <Check className="size-3" strokeWidth={3} />}
      </span>
      {done ? "Completed" : "Mark complete"}
      <span className="sr-only"> – {title}</span>
    </button>
  );
}
