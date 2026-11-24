import { cache } from "react";
import { categories } from "@/data/categories";
import { topics } from "@/data/topics";
import { resources } from "@/data/resources";
import { learningPaths } from "@/data/learning-paths";
import { projects } from "@/data/projects";
import { shouldUseDatabaseContent } from "@/lib/env";
import { difficultyOrder } from "@/lib/utils";
import type { CategorySlug, Project, Resource, Topic } from "@/types";
import { loadDatabaseContent } from "./database";
import type { ContentBundle } from "./types";

/**
 * THE CONTENT LAYER
 * ─────────────────
 * Pages and components get content ONLY through these functions — never by
 * importing /data directly. That way the data source can switch from local
 * files to Supabase (NEXUS_CONTENT_SOURCE=supabase) without touching any page.
 *
 * All functions are async so the database version is a drop-in replacement.
 */

const localContent: ContentBundle = { categories, topics, resources, learningPaths, projects };

/** Loads content once per request (React `cache`) and falls back to local data on errors. */
const getContent = cache(async (): Promise<ContentBundle> => {
  if (!shouldUseDatabaseContent()) return localContent;
  try {
    const db = await loadDatabaseContent();
    // Categories are fixed in code because they define the site's structure.
    return { categories, ...db };
  } catch (error) {
    console.error("[content] Falling back to local data:", error);
    return localContent;
  }
});

/* ── Categories & topics ───────────────────────────────── */

export async function getCategories() {
  return (await getContent()).categories;
}

export async function getCategory(slug: string) {
  return (await getCategories()).find((c) => c.slug === slug) ?? null;
}

export async function getTopics() {
  return (await getContent()).topics;
}

export async function getTopic(slug: string): Promise<Topic | null> {
  return (await getTopics()).find((t) => t.slug === slug) ?? null;
}

export async function getTopicsByCategory(category: CategorySlug) {
  return (await getTopics()).filter((t) => t.category === category);
}

export async function getPopularTopics(limit = 8) {
  return (await getTopics()).filter((t) => t.popular).slice(0, limit);
}

export async function getTopicsBySlugs(slugs: string[]) {
  const all = await getTopics();
  return slugs.map((s) => all.find((t) => t.slug === s)).filter((t): t is Topic => Boolean(t));
}

/* ── Resources ─────────────────────────────────────────── */

export async function getResources() {
  return (await getContent()).resources;
}

export async function getResourcesByIds(ids: string[]) {
  const all = await getResources();
  return ids.map((id) => all.find((r) => r.id === id)).filter((r): r is Resource => Boolean(r));
}

export async function getResourcesForTopic(slug: string) {
  const all = await getResources();
  return all
    .filter((r) => r.topics.includes(slug))
    .sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
}

/**
 * Most recently added resources (by addedAt; later entries in the data file win ties).
 * Paid items are skipped and types are interleaved so the homepage shows a varied mix.
 */
export async function getRecentResources(limit = 6) {
  const sorted = (await getResources())
    .map((r, index) => ({ r, index }))
    .filter(({ r }) => r.cost !== "paid")
    .sort((a, b) => b.r.addedAt.localeCompare(a.r.addedAt) || b.index - a.index)
    .map(({ r }) => r);
  const byType = new Map<string, Resource[]>();
  for (const r of sorted) byType.set(r.type, [...(byType.get(r.type) ?? []), r]);
  const mixed: Resource[] = [];
  while (mixed.length < limit && [...byType.values()].some((list) => list.length)) {
    for (const list of byType.values()) {
      const next = list.shift();
      if (next && mixed.length < limit) mixed.push(next);
    }
  }
  return mixed;
}

/* ── Learning paths ────────────────────────────────────── */

export async function getLearningPaths() {
  return (await getContent()).learningPaths;
}

export async function getLearningPath(slug: string) {
  return (await getLearningPaths()).find((p) => p.slug === slug) ?? null;
}

export async function getFeaturedLearningPaths(limit = 4) {
  return (await getLearningPaths()).filter((p) => p.featured).slice(0, limit);
}

/* ── Projects ──────────────────────────────────────────── */

export async function getProjects() {
  return (await getContent()).projects;
}

export async function getProject(slug: string) {
  return (await getProjects()).find((p) => p.slug === slug) ?? null;
}

export async function getFeaturedProjects(limit = 3) {
  return (await getProjects()).filter((p) => p.featured).slice(0, limit);
}

export async function getProjectsForTopic(slug: string) {
  return (await getProjects()).filter((p) => p.topics.includes(slug));
}

export async function getProjectsBySlugs(slugs: string[]) {
  const all = await getProjects();
  return slugs.map((s) => all.find((p) => p.slug === s)).filter((p): p is Project => Boolean(p));
}

export { getUpdates, getUpdate } from "./updates";
export { buildSearchIndex } from "./search-index";
