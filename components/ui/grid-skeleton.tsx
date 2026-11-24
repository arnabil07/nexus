import { Skeleton } from "./states";

/** Loading placeholder for card grids and lists. */
export function GridSkeleton({ count = 8, variant = "card" }: { count?: number; variant?: "card" | "row" }) {
  return (
    <div
      className={variant === "card" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-4" : "grid gap-3"}
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className={variant === "card" ? "h-48" : "h-28"} />
      ))}
    </div>
  );
}
