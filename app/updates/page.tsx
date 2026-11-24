import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/layout/container";
import { Notice } from "@/components/ui/states";
import { UpdatesBrowser } from "@/components/updates/updates-browser";
import { feedSources } from "@/config/feeds";
import { getUpdates } from "@/lib/content";

export const metadata: Metadata = {
  title: "Tech updates",
  description: "Recent technology news from reputable publishers, with the original source always linked.",
  alternates: { canonical: "/updates" },
};

// Refresh the feeds at most once an hour.
export const revalidate = 3600;

export default async function UpdatesPage() {
  const { items, mode, failedSources } = await getUpdates();

  return (
    <>
      <PageHeader
        eyebrow="Tech updates"
        title="Latest tech updates"
        description="Stay informed with recent posts from reputable technology publishers. Every item links to its original source."
      />
      <Container className="py-10 sm:py-12">
        {mode === "sample" ? (
          <Notice className="mb-8">
            <strong className="text-foreground">Showing sample items, not real news.</strong> Live feeds could not be
            loaded (or are disabled with <code>NEXUS_DISABLE_FEEDS</code>). Sample items have no dates or sources and
            are labelled “Sample”.
          </Notice>
        ) : (
          <Notice className="mb-8">
            Collected automatically from {feedSources.length} public RSS/Atom feeds and refreshed hourly. Summaries are
            short excerpts provided by each publisher; read the full article at the source.
            {failedSources.length > 0 && ` Currently unavailable: ${failedSources.join(", ")}.`}
          </Notice>
        )}
        <UpdatesBrowser updates={items} />
      </Container>
    </>
  );
}
