import { Container } from "@/components/layout/container";
import { GridSkeleton } from "@/components/ui/grid-skeleton";
import { Skeleton } from "@/components/ui/states";

/** Default loading state shown while a page's data loads. */
export default function Loading() {
  return (
    <Container className="py-16" aria-busy="true">
      <Skeleton className="mb-4 h-4 w-28" />
      <Skeleton className="mb-3 h-10 w-96 max-w-full" />
      <Skeleton className="mb-12 h-5 w-[32rem] max-w-full" />
      <GridSkeleton />
    </Container>
  );
}
