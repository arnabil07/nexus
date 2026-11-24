import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectCard, ResourceRow, TopicCard } from "@/components/cards/cards";
import { ContentIcon } from "@/components/icons";
import { Breadcrumbs, Container } from "@/components/layout/container";
import { BookmarkButton } from "@/components/library/library-client";
import { DotList, NumberedSection, StepList, TableOfContents } from "@/components/topics/topic-section";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import {
  getCategory,
  getProjectsForTopic,
  getResourcesForTopic,
  getTopic,
  getTopics,
  getTopicsBySlugs,
} from "@/lib/content";
import { resourceTypePlural } from "@/lib/utils";
import type { ResourceType } from "@/types";

type Props = { params: Promise<{ slug: string }> };

// Pre-render every topic page at build time.
export async function generateStaticParams() {
  return (await getTopics()).map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = await getTopic(slug);
  if (!topic) return { title: "Topic not found" };
  return {
    title: topic.title,
    description: topic.summary,
    alternates: { canonical: `/topics/${topic.slug}` },
    openGraph: { title: `${topic.title} · NEXUS`, description: topic.summary },
  };
}

/** Order in which resource sections appear on a topic page. */
const resourceOrder: ResourceType[] = [
  "video",
  "playlist",
  "article",
  "documentation",
  "course",
  "paper",
  "repository",
  "tool",
  "book",
];

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;
  const topic = await getTopic(slug);
  if (!topic) notFound();

  const [category, resources, projects, related] = await Promise.all([
    getCategory(topic.category),
    getResourcesForTopic(topic.slug),
    getProjectsForTopic(topic.slug),
    getTopicsBySlugs(topic.related),
  ]);

  const resourceSections = resourceOrder
    .map((type) => ({ type, items: resources.filter((r) => r.type === type) }))
    .filter((group) => group.items.length > 0);
  const missingTypes = resourceOrder
    .filter((type) => type !== "tool" && type !== "book")
    .filter((type) => !resources.some((r) => r.type === type));

  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "what-you-will-learn", title: "What you'll learn" },
    { id: "why-it-matters", title: "Why it matters" },
    { id: "prerequisites", title: "Prerequisites" },
    { id: "core-concepts", title: "Core concepts" },
    { id: "roadmap", title: "Learning roadmap" },
    ...resourceSections.map((group) => ({ id: `res-${group.type}`, title: resourceTypePlural[group.type] })),
    ...(projects.length ? [{ id: "projects", title: "Practical projects" }] : []),
    ...(related.length ? [{ id: "related", title: "Related topics" }] : []),
  ];
  const number = (id: string) => sections.findIndex((s) => s.id === id) + 1;

  return (
    <>
      <header className="border-b border-border">
        <Container className="py-12 sm:py-16">
          <Breadcrumbs
            items={[
              { label: "Explore", href: "/explore" },
              ...(category ? [{ label: category.title, href: `/explore?category=${category.slug}` }] : []),
              { label: topic.title },
            ]}
          />
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex items-center gap-3">
                <ContentIcon name={topic.icon} className="size-6 text-accent" strokeWidth={1.6} />
                <span className="eyebrow">{category?.title}</span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">{topic.title}</h1>
              <p className="mt-4 text-lg leading-relaxed text-secondary">{topic.summary}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <DifficultyBadge level={topic.level} />
                {topic.beginnerFriendly && <Badge tone="accent">Beginner friendly</Badge>}
                <Badge tone="outline">{resources.length} resources</Badge>
                {projects.length > 0 && <Badge tone="outline">{projects.length} projects</Badge>}
              </div>
            </div>
            <BookmarkButton type="topic" id={topic.slug} title={topic.title} variant="full" />
          </div>
        </Container>
      </header>

      <Container className="grid gap-10 py-12 lg:grid-cols-[15rem_1fr] lg:gap-16">
        <aside className="hidden lg:block">
          <TableOfContents items={sections} />
        </aside>

        <div className="min-w-0">
          <NumberedSection id="introduction" number={number("introduction")} title="Introduction">
            <p className="prose-nexus text-[1.0625rem]">{topic.introduction}</p>
          </NumberedSection>

          <NumberedSection id="what-you-will-learn" number={number("what-you-will-learn")} title="What you'll learn">
            <DotList items={topic.whatYouWillLearn} />
          </NumberedSection>

          <NumberedSection id="why-it-matters" number={number("why-it-matters")} title="Why it matters">
            <p className="prose-nexus mb-5">Real-world applications of {topic.title.toLowerCase()} include:</p>
            <DotList items={topic.applications} />
          </NumberedSection>

          <NumberedSection id="prerequisites" number={number("prerequisites")} title="Prerequisites">
            <DotList items={topic.prerequisites} />
          </NumberedSection>

          <NumberedSection id="core-concepts" number={number("core-concepts")} title="Core concepts">
            <dl className="grid gap-3 sm:grid-cols-2">
              {topic.coreConcepts.map((concept) => (
                <div key={concept.title} className="rounded-md border border-border bg-card p-4">
                  <dt className="font-medium text-foreground">{concept.title}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-secondary">{concept.description}</dd>
                </div>
              ))}
            </dl>
          </NumberedSection>

          <NumberedSection id="roadmap" number={number("roadmap")} title="Learning roadmap">
            <StepList steps={topic.roadmap} />
          </NumberedSection>

          {resourceSections.map((group) => (
            <NumberedSection
              key={group.type}
              id={`res-${group.type}`}
              number={number(`res-${group.type}`)}
              title={resourceTypePlural[group.type]}
            >
              <div className="grid gap-3">
                {group.items.map((resource) => (
                  <ResourceRow key={resource.id} resource={resource} />
                ))}
              </div>
            </NumberedSection>
          ))}

          {missingTypes.length > 0 && (
            <p className="border-b border-border py-6 text-sm text-muted">
              Not yet curated for this topic: {missingTypes.map((t) => resourceTypePlural[t].toLowerCase()).join(", ")}.{" "}
              <Link href="/resources" className="text-accent hover:text-accent-hover">
                Browse the full resource library
              </Link>
              .
            </p>
          )}

          {projects.length > 0 && (
            <NumberedSection id="projects" number={number("projects")} title="Practical projects">
              <div className="grid gap-4 md:grid-cols-2">
                {projects.map((project) => (
                  <ProjectCard key={project.slug} project={project} />
                ))}
              </div>
            </NumberedSection>
          )}

          {related.length > 0 && (
            <NumberedSection id="related" number={number("related")} title="Related topics">
              <div className="grid gap-4 md:grid-cols-3">
                {related.map((t) => (
                  <TopicCard key={t.slug} topic={t} />
                ))}
              </div>
            </NumberedSection>
          )}
        </div>
      </Container>
    </>
  );
}
