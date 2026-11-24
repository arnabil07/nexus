import { CircleAlert, Inbox, Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shown when a list has no items (e.g. no search results). */
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-md border border-dashed border-border px-6 py-14 text-center",
        className,
      )}
    >
      <Inbox className="mb-3 size-6 text-muted" aria-hidden="true" />
      <p className="font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-md text-sm text-secondary">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Shown when something fails to load. */
export function ErrorState({
  title = "Something went wrong",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div role="alert" className="rounded-md border border-border bg-surface px-6 py-10 text-center">
      <CircleAlert className="mx-auto mb-3 size-6 text-accent" aria-hidden="true" />
      <p className="font-medium text-foreground">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-md text-sm text-secondary">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** An inline information note, e.g. "Sample data" or "Accounts not configured". */
export function Notice({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex gap-3 rounded-md border border-border bg-surface px-4 py-3 text-sm text-secondary", className)}>
      <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
      <div className="[&_a]:text-accent [&_a:hover]:text-accent-hover [&_a]:underline [&_a]:underline-offset-4">
        {children}
      </div>
    </div>
  );
}

/** Grey placeholder block used while content loads. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-card", className)} />;
}
