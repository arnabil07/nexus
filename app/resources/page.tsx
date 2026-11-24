import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, PageHeader } from "@/components/layout/container";
import { ResourceLibrary } from "@/components/resources/resource-library";
import { GridSkeleton } from "@/components/ui/grid-skeleton";
import { getCategories, getResources, getTopics } from "@/lib/content";

export const metadata: Metadata = {
  title: "Resource library",
  description:
    "A curated library of free YouTube videos, courses, official documentation, research papers, GitHub repositories, tools and books.",
  alternates: { canonical: "/resources" },
};

export default async function ResourcesPage() {
  const [resources, topics, categories] = await Promise.all([getResources(), getTopics(), getCategories()]);
  return (
    <>
      <PageHeader
        eyebrow="Resources"
        title="Resource library"
        description="A curated collection of learning resources, each linked to its original publisher. Cost labels tell you exactly what is free."
      />
      <Container className="py-10 sm:py-12">
        <Suspense fallback={<GridSkeleton variant="row" count={6} />}>
          <ResourceLibrary
            resources={resources}
            topics={topics.map(({ slug, title, category }) => ({ slug, title, category }))}
            categories={categories}
          />
        </Suspense>
      </Container>
    </>
  );
}
