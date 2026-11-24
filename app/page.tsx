import Link from "next/link";
import { ArrowRight, BookOpen, Compass, Hammer, Search } from "lucide-react";
import { CategoryCard, PathCard, ProjectCard, ResourceRow, TopicCard, UpdateCard } from "@/components/cards/cards";
import { Container, Section, SectionHeader } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/states";
import { siteConfig } from "@/config/site";
import {
  getCategories,
  getFeaturedLearningPaths,
  getFeaturedProjects,
  getLearningPaths,
  getPopularTopics,
  getProjects,
  getRecentResources,
  getResources,
  getTopics,
  getUpdates,
} from "@/lib/content";

// Rebuild this page at most once an hour so tech updates stay fresh.
export const revalidate = 3600;

const suggestions = [
  { label: "Machine Learning", href: "/topics/machine-learning" },
  { label: "DevOps", href: "/topics/devops" },
  { label: "System Design", href: "/topics/system-design" },
  { label: "Cloud Computing", href: "/topics/cloud-computing" },
];

export default async function HomePage() {
  const [categories, topics, popularTopics, paths, allPaths, recentResources, allResources, projects, allProjects, updates] =
    await Promise.all([
      getCategories(),
      getTopics(),
      getPopularTopics(8),
      getFeaturedLearningPaths(4),
      getLearningPaths(),
      getRecentResources(6),
      getResources(),
      getFeaturedProjects(3),
      getProjects(),
      getUpdates(),
    ]);

  const stats = [
    { value: topics.length, label: "Technology topics" },
    { value: allPaths.length, label: "Learning paths" },
    { value: allResources.length, label: "Curated resources" },
    { value: allProjects.length, label: "Practical projects" },
  ];

  return (
    <>
      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border" aria-labelledby="hero-title">
        <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <Container className="relative grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_20rem] lg:items-end">
          <div>
            <p className="eyebrow mb-6">&#47;&#47; Explore · Learn · Build</p>
            <h1
              id="hero-title"
              className="max-w-3xl text-[2.5rem] font-semibold leading-[1.08] tracking-tight text-foreground sm:text-6xl"
            >
              Learn technology, <span className="text-accent">one step</span> at a time.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-secondary">
              Explore software engineering, artificial intelligence, cloud computing and more. Find useful resources
              and learn at your own pace.
            </p>

            <form action="/search" method="get" role="search" className="mt-9 flex max-w-xl items-center gap-2">
              <label htmlFor="hero-search" className="sr-only">
                Search topics and resources
              </label>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                <input
                  id="hero-search"
                  name="q"
                  type="search"
                  required
                  placeholder="Search topics, resources, paths…"
                  className="h-12 w-full rounded-md border border-border bg-surface pl-10 pr-3 text-[0.9375rem] text-foreground placeholder:text-muted focus:border-muted focus:outline-none"
                />
              </div>
              <button
                type="submit"
                aria-label="Search"
                className="flex size-12 shrink-0 items-center justify-center rounded-md bg-accent text-on-accent transition-colors hover:bg-accent-hover"
              >
                <ArrowRight className="size-5" aria-hidden="true" />
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm text-muted">Try:</span>
              {suggestions.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-secondary transition-colors hover:border-muted hover:text-foreground"
                >
                  {s.label}
                </Link>
              ))}
              <Link
                href="/explore"
                className="rounded-md border border-border px-3 py-1.5 text-sm text-secondary transition-colors hover:border-muted hover:text-foreground"
              >
                + More
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/explore" size="lg">
                Explore technologies <ArrowRight aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/learning-paths" variant="secondary" size="lg">
                Browse learning paths
              </ButtonLink>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border lg:grid-cols-1">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-background px-5 py-4">
                <dt className="font-mono text-xs uppercase tracking-[0.1em] text-muted">{stat.label}</dt>
                <dd className="mt-1 text-2xl font-semibold text-foreground">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* ── Explore topics ─────────────────────────────── */}
      <Section labelledBy="explore-title">
        <SectionHeader
          id="explore-title"
          eyebrow="Explore"
          title="Explore topics"
          description="Start with the most popular areas of technology, or browse all topics."
          href="/explore"
          linkLabel="All topics"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popularTopics.map((topic) => (
            <TopicCard key={topic.slug} topic={topic} />
          ))}
        </div>
      </Section>

      {/* ── Categories ─────────────────────────────────── */}
      <Section labelledBy="categories-title" className="border-y border-border bg-surface">
        <SectionHeader
          id="categories-title"
          eyebrow="Categories"
          title="Featured technology categories"
          description="Every topic belongs to one of six areas of technology."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.slug}
              category={category}
              topicCount={topics.filter((t) => t.category === category.slug).length}
            />
          ))}
        </div>
      </Section>

      {/* ── Learning paths ─────────────────────────────── */}
      <Section labelledBy="paths-title">
        <SectionHeader
          id="paths-title"
          eyebrow="Learning paths"
          title="Popular learning paths"
          description="Structured roadmaps that take you from first steps to job-ready skills."
          href="/learning-paths"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {paths.map((path) => (
            <PathCard key={path.slug} path={path} />
          ))}
        </div>
      </Section>

      {/* ── Recent resources ───────────────────────────── */}
      <Section labelledBy="resources-title" className="border-y border-border bg-surface">
        <SectionHeader
          id="resources-title"
          eyebrow="Resources"
          title="Recently added resources"
          description="Free videos, courses, documentation, papers and repositories from their original publishers."
          href="/resources"
        />
        <div className="grid gap-3 lg:grid-cols-2">
          {recentResources.map((resource) => (
            <ResourceRow key={resource.id} resource={resource} />
          ))}
        </div>
      </Section>

      {/* ── Tech updates ───────────────────────────────── */}
      <Section labelledBy="updates-title">
        <SectionHeader
          id="updates-title"
          eyebrow="Tech updates"
          title="Latest technology updates"
          description="Recent posts from reputable technology publishers, always linked to the original source."
          href="/updates"
        />
        {updates.mode === "sample" && (
          <Notice className="mb-5">
            Live feeds are unavailable right now, so these are clearly labelled sample items, not real news.
          </Notice>
        )}
        <div className="grid gap-4 md:grid-cols-3">
          {updates.items.slice(0, 3).map((update) => (
            <UpdateCard key={update.id} update={update} />
          ))}
        </div>
      </Section>

      {/* ── Projects ───────────────────────────────────── */}
      <Section labelledBy="projects-title" className="border-y border-border bg-surface">
        <SectionHeader
          id="projects-title"
          eyebrow="Projects"
          title="Featured projects"
          description="Practise what you learn by building real things."
          href="/projects"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </Section>

      {/* ── About ──────────────────────────────────────── */}
      <Section id="about" labelledBy="about-title">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow mb-3">About NEXUS</p>
            <h2 id="about-title" className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
              Not another link directory.
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-secondary">
              {siteConfig.name} organises the best free learning material on the internet into topics, learning paths
              and projects, so you always know what to learn next and where to learn it.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
            {[
              { icon: Compass, title: "Explore", text: "Understand what each area of technology is, why it matters and how it fits together." },
              { icon: BookOpen, title: "Learn", text: "Follow ordered learning paths with hand-picked resources from original publishers." },
              { icon: Hammer, title: "Build", text: "Turn knowledge into skill with practical, step-by-step project briefs." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-background p-6">
                <Icon className="mb-4 size-5 text-accent" aria-hidden="true" />
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-secondary">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
