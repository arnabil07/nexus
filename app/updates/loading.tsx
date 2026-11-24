import { Container } from "@/components/layout/container";
import { GridSkeleton } from "@/components/ui/grid-skeleton";
import { Skeleton } from "@/components/ui/states";

export default function UpdatesLoading() {
  return (
    <Container className="py-16">
      <Skeleton className="mb-4 h-4 w-32" />
      <Skeleton className="mb-10 h-10 w-80 max-w-full" />
      <GridSkeleton count={6} />
    </Container>
  );
}
