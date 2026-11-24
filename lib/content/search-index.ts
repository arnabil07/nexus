import { categories } from "@/data/categories";
import {
  difficultyLabel,
  projectCategoryLabel,
  resourceTypeLabel,
  updateCategoryLabel,
} from "@/lib/utils";
import type { SearchItem } from "@/types";
import { getLearningPaths, getProjects, getResources, getTopics } from "./index";
import { getUpdates } from "./updates";

/**
 * Builds a flat list of everything searchable. The ⌘K menu receives the
 * static part (no updates) so it stays small; the /search page includes updates.
 */
export async function buildSearchIndex(options: { includeUpdates?: boolean } = {}): Promise<SearchItem[]> {
  const [topics, resources, paths, projects] = await Promise.all([
    getTopics(),
    getResources(),
    getLearningPaths(),
    getProjects(),
  ]);
  const categoryTitle = new Map(categories.map((c) => [c.slug, c.title]));

  const items: SearchItem[] = [
    ...topics.map<SearchItem>((t) => ({
      id: `topic:${t.slug}`,
      type: "topic",
      title: t.title,
      description: t.summary,
      href: `/topics/${t.slug}`,
      external: false,
      meta: `Topic · ${categoryTitle.get(t.category) ?? ""}`,
      keywords: [t.category, ...t.coreConcepts.map((c) => c.title)],
    })),
    ...paths.map<SearchItem>((p) => ({
      id: `path:${p.slug}`,
      type: "path",
      title: p.title,
      description: p.description,
      href: `/learning-paths/${p.slug}`,
      external: false,
      meta: `Learning path · ${difficultyLabel[p.difficulty]} · ${p.duration}`,
      keywords: p.skills,
    })),
    ...projects.map<SearchItem>((p) => ({
      id: `project:${p.slug}`,
      type: "project",
      title: p.title,
      description: p.description,
      href: `/projects/${p.slug}`,
      external: false,
      meta: `Project · ${projectCategoryLabel[p.category]} · ${difficultyLabel[p.difficulty]}`,
      keywords: [...p.technologies, ...p.skills],
    })),
    ...resources.map<SearchItem>((r) => ({
      id: `resource:${r.id}`,
      type: "resource",
      title: r.title,
      description: r.description,
      href: r.url,
      external: true,
      meta: `${resourceTypeLabel[r.type]} · ${r.publisher}`,
      keywords: [...r.topics, r.publisher, r.type],
    })),
  ];

  if (options.includeUpdates) {
    const { items: updates } = await getUpdates();
    items.push(
      ...updates.map<SearchItem>((u) => ({
        id: `update:${u.id}`,
        type: "update",
        title: u.title,
        description: u.summary,
        href: `/updates/${u.id}`,
        external: false,
        meta: `${u.isSample ? "Sample" : "Update"} · ${updateCategoryLabel[u.category]} · ${u.source}`,
        keywords: [u.category, u.source],
      })),
    );
  }
  return items;
}
