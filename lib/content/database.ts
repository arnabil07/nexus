import { createPublicClient } from "@/lib/supabase/public";
import type {
  CategorySlug,
  ConceptItem,
  CostType,
  Difficulty,
  IconName,
  LearningPath,
  Project,
  ProjectCategory,
  Resource,
  ResourceType,
  TechUpdate,
  Topic,
  UpdateCategory,
} from "@/types";
import type { ContentBundle } from "./types";

/**
 * Loads all public content from Supabase and maps database rows (snake_case)
 * to the app's TypeScript types (camelCase). Only used when
 * NEXUS_CONTENT_SOURCE=supabase. Errors are thrown so the caller can fall back
 * to local data.
 */

interface TopicRow {
  slug: string;
  title: string;
  category: string;
  icon: string;
  summary: string;
  level: string;
  beginner_friendly: boolean;
  popular: boolean;
  introduction: string;
  what_you_will_learn: string[];
  applications: string[];
  prerequisites: string[];
  core_concepts: ConceptItem[];
  roadmap: ConceptItem[];
  related: string[];
}

interface ResourceRow {
  id: string;
  title: string;
  description: string;
  type: string;
  publisher: string;
  url: string;
  difficulty: string;
  cost: string;
  cost_note: string | null;
  language: string;
  citation: string | null;
  added_at: string;
  verified: boolean;
}

interface TopicResourceRow {
  topic_slug: string;
  resource_id: string;
}

interface PathRow {
  slug: string;
  title: string;
  description: string;
  icon: string;
  difficulty: string;
  duration: string;
  outcome: string;
  skills: string[];
  featured: boolean;
}

interface StageRow {
  path_slug: string;
  stage_id: string;
  position: number;
  title: string;
  description: string;
  skills: string[];
  resource_ids: string[];
  exercise: string;
  project_slug: string | null;
}

interface ProjectRow {
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  duration: string;
  description: string;
  technologies: string[];
  skills: string[];
  requirements: string[];
  steps: ConceptItem[];
  outcome: string;
  topics: string[];
  resource_ids: string[];
  github_url: string | null;
  featured: boolean;
}

interface UpdateRow {
  id: string;
  title: string;
  summary: string;
  category: string;
  source: string;
  published_at: string;
  url: string;
}

export async function loadDatabaseContent(): Promise<Omit<ContentBundle, "categories">> {
  const supabase = createPublicClient();
  if (!supabase) throw new Error("Supabase is not configured");

  const [topicsRes, resourcesRes, linksRes, pathsRes, stagesRes, projectsRes] = await Promise.all([
    supabase.from("topics").select("*").eq("is_published", true).order("sort_order"),
    supabase.from("resources").select("*").eq("is_published", true).order("sort_order"),
    supabase.from("topic_resources").select("topic_slug, resource_id"),
    supabase.from("learning_paths").select("*").eq("is_published", true).order("sort_order"),
    supabase.from("learning_path_stages").select("*").order("position"),
    supabase.from("projects").select("*").eq("is_published", true).order("sort_order"),
  ]);

  const firstError =
    topicsRes.error || resourcesRes.error || linksRes.error || pathsRes.error || stagesRes.error || projectsRes.error;
  if (firstError) throw new Error(`Supabase content query failed: ${firstError.message}`);

  const links = (linksRes.data ?? []) as TopicResourceRow[];
  const topicsByResource = new Map<string, string[]>();
  for (const link of links) {
    const list = topicsByResource.get(link.resource_id) ?? [];
    list.push(link.topic_slug);
    topicsByResource.set(link.resource_id, list);
  }

  const topics: Topic[] = ((topicsRes.data ?? []) as TopicRow[]).map((row) => ({
    slug: row.slug,
    title: row.title,
    category: row.category as CategorySlug,
    icon: row.icon as IconName,
    summary: row.summary,
    level: row.level as Difficulty,
    beginnerFriendly: row.beginner_friendly,
    popular: row.popular,
    introduction: row.introduction,
    whatYouWillLearn: row.what_you_will_learn ?? [],
    applications: row.applications ?? [],
    prerequisites: row.prerequisites ?? [],
    coreConcepts: row.core_concepts ?? [],
    roadmap: row.roadmap ?? [],
    related: row.related ?? [],
  }));

  const resources: Resource[] = ((resourcesRes.data ?? []) as ResourceRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type as ResourceType,
    publisher: row.publisher,
    url: row.url,
    topics: topicsByResource.get(row.id) ?? [],
    difficulty: row.difficulty as Difficulty,
    cost: row.cost as CostType,
    costNote: row.cost_note ?? undefined,
    language: row.language,
    citation: row.citation ?? undefined,
    addedAt: row.added_at,
    verified: row.verified,
  }));

  const stages = (stagesRes.data ?? []) as StageRow[];
  const learningPaths: LearningPath[] = ((pathsRes.data ?? []) as PathRow[]).map((row) => ({
    slug: row.slug,
    title: row.title,
    description: row.description,
    icon: row.icon as IconName,
    difficulty: row.difficulty as Difficulty,
    duration: row.duration,
    outcome: row.outcome,
    skills: row.skills ?? [],
    featured: row.featured,
    stages: stages
      .filter((s) => s.path_slug === row.slug)
      .sort((a, b) => a.position - b.position)
      .map((s) => ({
        id: s.stage_id,
        title: s.title,
        description: s.description,
        skills: s.skills ?? [],
        resources: s.resource_ids ?? [],
        exercise: s.exercise,
        project: s.project_slug ?? undefined,
      })),
  }));

  const projects: Project[] = ((projectsRes.data ?? []) as ProjectRow[]).map((row) => ({
    slug: row.slug,
    title: row.title,
    category: row.category as ProjectCategory,
    difficulty: row.difficulty as Difficulty,
    duration: row.duration,
    description: row.description,
    technologies: row.technologies ?? [],
    skills: row.skills ?? [],
    requirements: row.requirements ?? [],
    steps: row.steps ?? [],
    outcome: row.outcome,
    topics: row.topics ?? [],
    resources: row.resource_ids ?? [],
    githubUrl: row.github_url ?? undefined,
    featured: row.featured,
  }));

  return { topics, resources, learningPaths, projects };
}

/** Curated, real updates stored in the tech_updates table (optional). */
export async function loadDatabaseUpdates(): Promise<TechUpdate[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("tech_updates")
    .select("id, title, summary, category, source, published_at, url")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(`Supabase updates query failed: ${error.message}`);
  return ((data ?? []) as UpdateRow[]).map((row) => ({
    id: `db-${row.id}`,
    title: row.title,
    summary: row.summary,
    category: row.category as UpdateCategory,
    source: row.source,
    publishedAt: row.published_at,
    url: row.url,
    isSample: false,
  }));
}
