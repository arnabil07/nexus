import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { ResourceRow, TopicCard } from "@/components/cards/cards";
import { GitHubMark } from "@/components/icons";
import { Breadcrumbs, Container } from "@/components/layout/container";
import { BookmarkButton } from "@/components/library/library-client";
import { DotList, NumberedSection, StepList, TableOfContents } from "@/components/topics/topic-section";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ExternalLink } from "@/components/ui/external-link";
import { getProject, getProjects, getResourcesByIds, getTopicsBySlugs } from "@/lib/content";
import { projectCategoryLabel } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProjects()).map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: `${project.title} project`,
    description: project.description,
    alternates: { canonical: `/projects/${project.slug}` },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const [resources, topics] = await Promise.all([getResourcesByIds(project.resources), getTopicsBySlugs(project.topics)]);

  const sections = [
    { id: "overview", title: "Overview" },
    { id: "requirements", title: "Requirements" },
    { id: "skills", title: "Technologies & skills" },
    { id: "steps", title: "Implementation steps" },
    { id: "outcome", title: "Expected outcome" },
    ...(resources.length ? [{ id: "resources", title: "Helpful resources" }] : []),
    ...(topics.length ? [{ id: "topics", title: "Related topics" }] : []),
  ];
  const number = (id: string) => sections.findIndex((s) => s.id === id) + 1;

  return (
    <>
      <header className="border-b border-border">
        <Container className="py-12 sm:py-16">
          <Breadcrumbs items={[{ label: "Projects", href: "/projects" }, { label: project.title }]} />
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow mb-4">{projectCategoryLabel[project.category]}</p>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">{project.title}</h1>
              <p className="mt-4 text-lg leading-relaxed text-secondary">{project.description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <DifficultyBadge level={project.difficulty} />
                <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted">
                  <Clock className="size-3.5" aria-hidden="true" /> {project.duration}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <BookmarkButton type="project" id={project.slug} title={project.title} variant="full" />
              {project.githubUrl && (
                <ExternalLink href={project.githubUrl} className={buttonVariants({ variant: "secondary" })}>
                  <GitHubMark className="size-4" /> GitHub
                </ExternalLink>
              )}
            </div>
          </div>
        </Container>
      </header>

      <Container className="grid gap-10 py-12 lg:grid-cols-[15rem_1fr] lg:gap-16">
        <aside className="hidden lg:block">
          <TableOfContents items={sections} />
        </aside>
        <div className="min-w-0">
          <NumberedSection id="overview" number={number("overview")} title="Overview">
            <p className="prose-nexus text-[1.0625rem]">{project.description}</p>
            <p className="prose-nexus mt-4 text-sm text-muted">
              This is a project brief written for NEXUS: it explains what to build and how. Follow the steps and use
              the linked resources when you get stuck.
            </p>
          </NumberedSection>

          <NumberedSection id="requirements" number={number("requirements")} title="Requirements">
            <DotList items={project.requirements} />
          </NumberedSection>

          <NumberedSection id="skills" number={number("skills")} title="Technologies & skills">
            <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.12em] text-muted">Technologies</h3>
            <div className="mb-6 flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <Badge key={tech} tone="outline">
                  {tech}
                </Badge>
              ))}
            </div>
            <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.12em] text-muted">Skills you&apos;ll learn</h3>
            <DotList items={project.skills} />
          </NumberedSection>

          <NumberedSection id="steps" number={number("steps")} title="Implementation steps">
            <StepList steps={project.steps} />
          </NumberedSection>

          <NumberedSection id="outcome" number={number("outcome")} title="Expected outcome">
            <p className="rounded-md border border-border bg-card p-5 text-foreground">{project.outcome}</p>
          </NumberedSection>

          {resources.length > 0 && (
            <NumberedSection id="resources" number={number("resources")} title="Helpful resources">
              <div className="grid gap-3">
                {resources.map((resource) => (
                  <ResourceRow key={resource.id} resource={resource} />
                ))}
              </div>
            </NumberedSection>
          )}

          {topics.length > 0 && (
            <NumberedSection id="topics" number={number("topics")} title="Related topics">
              <div className="grid gap-4 md:grid-cols-3">
                {topics.map((topic) => (
                  <TopicCard key={topic.slug} topic={topic} />
                ))}
              </div>
            </NumberedSection>
          )}
        </div>
      </Container>
    </>
  );
}
