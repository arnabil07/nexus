import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock, Hammer, Layers, Target } from "lucide-react";
import { ResourceRow } from "@/components/cards/cards";
import { ContentIcon } from "@/components/icons";
import { Breadcrumbs, Container } from "@/components/layout/container";
import { BookmarkButton } from "@/components/library/library-client";
import { PathProgressBar, StageToggle } from "@/components/paths/path-progress";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import { SyncNotice } from "@/components/library/sync-notice";
import { getLearningPath, getLearningPaths, getProjectsBySlugs, getResourcesByIds } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getLearningPaths()).map((path) => ({ slug: path.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = await getLearningPath(slug);
  if (!path) return { title: "Learning path not found" };
  return {
    title: `${path.title} learning path`,
    description: path.description,
    alternates: { canonical: `/learning-paths/${path.slug}` },
  };
}

export default async function LearningPathPage({ params }: Props) {
  const { slug } = await params;
  const path = await getLearningPath(slug);
  if (!path) notFound();

  const allResourceIds = [...new Set(path.stages.flatMap((s) => s.resources))];
  const projectSlugs = path.stages.map((s) => s.project).filter((p): p is string => Boolean(p));
  const [resources, projects] = await Promise.all([getResourcesByIds(allResourceIds), getProjectsBySlugs(projectSlugs)]);
  const resourceById = new Map(resources.map((r) => [r.id, r]));
  const projectBySlug = new Map(projects.map((p) => [p.slug, p]));
  const stageIds = path.stages.map((s) => s.id);

  return (
    <>
      <header className="border-b border-border">
        <Container className="py-12 sm:py-16">
          <Breadcrumbs items={[{ label: "Learning paths", href: "/learning-paths" }, { label: path.title }]} />
          <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
            <div>
              <ContentIcon name={path.icon} className="mb-5 size-7 text-accent" strokeWidth={1.6} />
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">{path.title}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-secondary">{path.description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-muted">
                <DifficultyBadge level={path.difficulty} />
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5" aria-hidden="true" /> {path.duration}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="size-3.5" aria-hidden="true" /> {path.stages.length} stages
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-5 rounded-md border border-border bg-card p-5">
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Target className="size-4 text-accent" aria-hidden="true" /> Outcome
                </p>
                <p className="text-sm leading-relaxed text-secondary">{path.outcome}</p>
              </div>
              <PathProgressBar pathSlug={path.slug} stageIds={stageIds} />
              <BookmarkButton type="path" id={path.slug} title={path.title} variant="full" />
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            <span className="mr-1 self-center text-sm text-muted">Skills:</span>
            {path.skills.map((skill) => (
              <Badge key={skill} tone="outline">
                {skill}
              </Badge>
            ))}
          </div>
        </Container>
      </header>

      <Container className="max-w-5xl py-12">
        <SyncNotice className="mb-10" />

        <ol className="space-y-6">
          {path.stages.map((stage, index) => {
            const project = stage.project ? projectBySlug.get(stage.project) : undefined;
            return (
              <li key={stage.id} id={stage.id} className="scroll-mt-24 rounded-md border border-border bg-surface">
                <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                  <div>
                    <p className="font-mono text-xs text-accent">Stage {String(index + 1).padStart(2, "0")}</p>
                    <h2 className="mt-1 text-xl font-semibold text-foreground">{stage.title}</h2>
                    <p className="mt-2 text-secondary">{stage.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {stage.skills.map((skill) => (
                        <Badge key={skill}>{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <StageToggle pathSlug={path.slug} stageId={stage.id} title={stage.title} />
                </div>

                <div className="space-y-6 p-5 sm:p-6">
                  <div>
                    <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.12em] text-muted">Recommended resources</h3>
                    <div className="grid gap-3">
                      {stage.resources.map((id) => {
                        const resource = resourceById.get(id);
                        return resource ? <ResourceRow key={id} resource={resource} /> : null;
                      })}
                    </div>
                  </div>

                  <div className="rounded-md border border-dashed border-border p-4">
                    <h3 className="mb-1 font-mono text-xs uppercase tracking-[0.12em] text-muted">Practical exercise</h3>
                    <p className="text-foreground">{stage.exercise}</p>
                  </div>

                  {project && (
                    <Link
                      href={`/projects/${project.slug}`}
                      className="group flex items-center justify-between gap-4 rounded-md border border-border bg-card p-4 hover:border-muted"
                    >
                      <span className="flex items-center gap-3">
                        <Hammer className="size-4 text-accent" aria-hidden="true" />
                        <span>
                          <span className="block font-mono text-xs uppercase tracking-[0.12em] text-muted">Project</span>
                          <span className="font-medium text-foreground">{project.title}</span>
                        </span>
                      </span>
                      <ArrowRight className="size-4 text-accent transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </Container>
    </>
  );
}
