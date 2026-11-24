import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock, Layers } from "lucide-react";
import { ContentIcon } from "@/components/icons";
import { BookmarkButton } from "@/components/library/library-client";
import { CostBadge, DifficultyBadge, SampleBadge, Badge } from "@/components/ui/badge";
import {
  cn,
  formatDate,
  projectCategoryLabel,
  resourceTypeLabel,
  updateCategoryLabel,
} from "@/lib/utils";
import type { Category, LearningPath, Project, Resource, TechUpdate, Topic } from "@/types";

/**
 * All content cards share one look: dark card, subtle border, border lightens
 * on hover. The title link is "stretched" over the card (after:inset-0) so the
 * whole card is clickable while bookmark buttons stay separately clickable.
 */
export const cardBase =
  "group relative flex flex-col rounded-md border border-border bg-card p-5 transition-colors duration-150 hover:border-muted focus-within:border-muted";

const stretchedLink =
  "after:absolute after:inset-0 after:rounded-md after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-accent";

function CardArrow({ external = false }: { external?: boolean }) {
  const Icon = external ? ArrowUpRight : ArrowRight;
  return (
    <Icon
      className="size-4 shrink-0 text-accent transition-transform duration-150 group-hover:translate-x-0.5"
      aria-hidden="true"
    />
  );
}

export function CategoryCard({ category, topicCount }: { category: Category; topicCount: number }) {
  return (
    <article className={cardBase}>
      <ContentIcon name={category.icon} className="mb-5 size-6 text-accent" strokeWidth={1.6} />
      <h3 className="font-semibold text-foreground">
        <Link href={`/explore?category=${category.slug}`} className={stretchedLink}>
          {category.title}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-secondary">{category.description}</p>
      <div className="mt-5 flex items-center justify-between">
        <span className="font-mono text-xs text-muted">{topicCount} topics</span>
        <CardArrow />
      </div>
    </article>
  );
}

export function TopicCard({ topic }: { topic: Topic }) {
  return (
    <article className={cardBase}>
      <div className="mb-4 flex items-start justify-between">
        <ContentIcon name={topic.icon} className="size-5 text-accent" strokeWidth={1.7} />
        <BookmarkButton type="topic" id={topic.slug} title={topic.title} className="-mr-2 -mt-2" />
      </div>
      <h3 className="font-semibold text-foreground">
        <Link href={`/topics/${topic.slug}`} className={stretchedLink}>
          {topic.title}
        </Link>
      </h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-secondary">{topic.summary}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <DifficultyBadge level={topic.level} />
        {topic.beginnerFriendly && <Badge tone="accent">Beginner friendly</Badge>}
      </div>
    </article>
  );
}

export function PathCard({ path }: { path: LearningPath }) {
  return (
    <article className={cardBase}>
      <div className="mb-5 flex items-start justify-between">
        <ContentIcon name={path.icon} className="size-6 text-accent" strokeWidth={1.6} />
        <BookmarkButton type="path" id={path.slug} title={path.title} className="-mr-2 -mt-2" />
      </div>
      <h3 className="font-semibold leading-snug text-foreground">
        <Link href={`/learning-paths/${path.slug}`} className={stretchedLink}>
          {path.title}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-secondary">{path.description}</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Layers className="size-3.5" aria-hidden="true" />
            {path.stages.length} stages
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden="true" />
            {path.duration.replace(" part-time", "")}
          </span>
        </div>
        <CardArrow />
      </div>
    </article>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className={cardBase}>
      <div className="mb-3 flex items-start justify-between">
        <span className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted">
          {projectCategoryLabel[project.category]}
        </span>
        <BookmarkButton type="project" id={project.slug} title={project.title} className="-mr-2 -mt-2" />
      </div>
      <h3 className="font-semibold leading-snug text-foreground">
        <Link href={`/projects/${project.slug}`} className={stretchedLink}>
          {project.title}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-secondary">{project.description}</p>
      <p className="mt-4 truncate font-mono text-xs text-muted">{project.technologies.join(" · ")}</p>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DifficultyBadge level={project.difficulty} />
          <span className="font-mono text-xs text-muted">{project.duration}</span>
        </div>
        <CardArrow />
      </div>
    </article>
  );
}

/** Compact row used in the resource library and on topic pages. */
export function ResourceRow({ resource, className }: { resource: Resource; className?: string }) {
  return (
    <article className={cn(cardBase, "flex-row items-start gap-4 p-4", className)}>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-accent">
            {resourceTypeLabel[resource.type]}
          </span>
          <CostBadge cost={resource.cost} />
          <DifficultyBadge level={resource.difficulty} />
        </div>
        <h3 className="font-medium leading-snug text-foreground">
          <a href={resource.url} target="_blank" rel="noopener noreferrer" className={stretchedLink}>
            {resource.title}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-secondary">{resource.description}</p>
        <p className="mt-2 font-mono text-xs text-muted">
          {resource.publisher}
          {resource.citation && ` · ${resource.citation}`}
          {resource.costNote && <span className="block pt-1 font-sans text-muted">{resource.costNote}</span>}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-3">
        <BookmarkButton type="resource" id={resource.id} title={resource.title} className="-mr-1.5 -mt-1.5" />
        <CardArrow external />
      </div>
    </article>
  );
}

export function UpdateCard({ update }: { update: TechUpdate }) {
  const date = formatDate(update.publishedAt);
  return (
    <article className={cardBase}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-accent">
          {updateCategoryLabel[update.category]}
        </span>
        {update.isSample && <SampleBadge />}
      </div>
      <h3 className="font-semibold leading-snug text-foreground">
        <Link href={`/updates/${update.id}`} className={stretchedLink}>
          {update.title}
        </Link>
      </h3>
      {update.summary && <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-secondary">{update.summary}</p>}
      <div className="mt-4 flex items-center justify-between gap-3 font-mono text-xs text-muted">
        <span className="truncate">
          {update.source}
          {date ? ` · ${date}` : update.isSample ? " · No date (sample)" : " · Date not provided"}
        </span>
        <CardArrow />
      </div>
    </article>
  );
}
