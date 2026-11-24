import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight, Calendar, Newspaper } from "lucide-react";
import { UpdateCard } from "@/components/cards/cards";
import { Breadcrumbs, Container } from "@/components/layout/container";
import { SampleBadge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ExternalLink } from "@/components/ui/external-link";
import { Notice } from "@/components/ui/states";
import { getUpdate, getUpdates } from "@/lib/content";
import { formatDate, updateCategoryLabel } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const update = await getUpdate(id);
  if (!update) return { title: "Update not found" };
  return {
    title: update.title,
    description: update.summary || `${updateCategoryLabel[update.category]} update from ${update.source}.`,
    // Feed items are summaries of other publishers' articles, so we point search engines to the source.
    robots: { index: false, follow: true },
  };
}

export default async function UpdatePage({ params }: Props) {
  const { id } = await params;
  const update = await getUpdate(id);
  if (!update) notFound();

  const { items } = await getUpdates();
  const more = items.filter((u) => u.category === update.category && u.id !== update.id).slice(0, 3);
  const date = formatDate(update.publishedAt);

  return (
    <>
      <article>
        <header className="border-b border-border">
          <Container className="max-w-4xl py-12 sm:py-16">
            <Breadcrumbs items={[{ label: "Tech updates", href: "/updates" }, { label: updateCategoryLabel[update.category] }]} />
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="eyebrow">{updateCategoryLabel[update.category]}</span>
              {update.isSample && <SampleBadge />}
            </div>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">{update.title}</h1>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Newspaper className="size-3.5" aria-hidden="true" /> {update.source}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5" aria-hidden="true" />
                {date ? <time dateTime={update.publishedAt ?? undefined}>{date}</time> : update.isSample ? "No date (sample)" : "Date not provided by source"}
              </span>
            </div>
          </Container>
        </header>

        <Container className="max-w-4xl py-10">
          {update.isSample ? (
            <Notice className="mb-8">
              This is an illustrative sample item, not real news. It has no source article. Real updates appear here
              automatically when live feeds are available.
            </Notice>
          ) : null}

          {update.summary ? (
            <div>
              <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.12em] text-muted">Summary from the publisher</h2>
              <p className="prose-nexus text-[1.0625rem]">{update.summary}</p>
            </div>
          ) : (
            <p className="prose-nexus">The publisher did not include a summary. Read the full article at the source.</p>
          )}

          {update.url && (
            <div className="mt-8 flex flex-col gap-3 rounded-md border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-secondary">
                Originally published by <span className="text-foreground">{update.source}</span>.
              </p>
              <ExternalLink href={update.url} className={buttonVariants()}>
                Read the full article <ArrowUpRight aria-hidden="true" />
              </ExternalLink>
            </div>
          )}
        </Container>
      </article>

      {more.length > 0 && (
        <Container className="max-w-5xl pb-16">
          <h2 className="mb-4 text-lg font-semibold text-foreground">More in {updateCategoryLabel[update.category]}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {more.map((u) => (
              <UpdateCard key={u.id} update={u} />
            ))}
          </div>
        </Container>
      )}
    </>
  );
}
