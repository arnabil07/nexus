import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, PageHeader } from "@/components/layout/container";
import { ExploreBrowser } from "@/components/topics/explore-browser";
import { GridSkeleton } from "@/components/ui/grid-skeleton";
import { getCategories, getTopics } from "@/lib/content";

export const metadata: Metadata = {
  title: "Explore topics",
  description: "Browse every technology topic on NEXUS by category, from programming fundamentals to quantum computing.",
  alternates: { canonical: "/explore" },
};

export default async function ExplorePage() {
  const [topics, categories] = await Promise.all([getTopics(), getCategories()]);

  return (
    <>
      <PageHeader
        eyebrow="Explore"
        title="Explore topics"
        description="Dive into different technology areas and find the right resources to learn them."
      />
      <Container className="py-10 sm:py-12">
        {/* useSearchParams() in the browser component needs a Suspense boundary. */}
        <Suspense fallback={<GridSkeleton />}>
          <ExploreBrowser topics={topics} categories={categories} />
        </Suspense>
      </Container>
    </>
  );
}
