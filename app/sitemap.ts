import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getLearningPaths, getProjects, getTopics } from "@/lib/content";

/** Generates /sitemap.xml for search engines. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const [topics, paths, projects] = await Promise.all([getTopics(), getLearningPaths(), getProjects()]);
  const now = new Date();

  const staticRoutes = ["", "/explore", "/learning-paths", "/resources", "/updates", "/projects"].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "/updates" ? ("hourly" as const) : ("weekly" as const),
    priority: path === "" ? 1 : 0.8,
  }));

  return [
    ...staticRoutes,
    ...topics.map((t) => ({ url: `${base}/topics/${t.slug}`, lastModified: now, priority: 0.7 })),
    ...paths.map((p) => ({ url: `${base}/learning-paths/${p.slug}`, lastModified: now, priority: 0.7 })),
    ...projects.map((p) => ({ url: `${base}/projects/${p.slug}`, lastModified: now, priority: 0.6 })),
  ];
}
