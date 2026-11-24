import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/layout/container";
import { LibraryView } from "@/components/library/library-view";
import { SyncNotice } from "@/components/library/sync-notice";
import { buildSearchIndex, getLearningPaths } from "@/lib/content";

export const metadata: Metadata = {
  title: "Your library",
  description: "Your saved topics, learning paths, projects and resources, plus your learning progress.",
  robots: { index: false, follow: false },
};

export default async function LibraryPage() {
  const [items, paths] = await Promise.all([buildSearchIndex(), getLearningPaths()]);
  return (
    <>
      <PageHeader
        eyebrow="Library"
        title="Your library"
        description="Everything you've saved and the learning paths you're working through."
      />
      <Container className="py-10 sm:py-12">
        <SyncNotice className="mb-10" />
        <LibraryView items={items} paths={paths.map(({ slug, title, stages }) => ({ slug, title, stages }))} />
      </Container>
    </>
  );
}
