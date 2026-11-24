import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CostType, Difficulty, ResourceType, UpdateCategory, ProjectCategory } from "@/types";

/**
 * cn() combines class names and resolves Tailwind conflicts.
 * Example: cn("px-2", isLarge && "px-4") → "px-4" when isLarge is true.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const difficultyLabel: Record<Difficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const difficultyOrder: Record<Difficulty, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

export const resourceTypeLabel: Record<ResourceType, string> = {
  video: "YouTube Video",
  playlist: "YouTube Playlist",
  article: "Article & Blog",
  documentation: "Documentation",
  course: "Free Course",
  paper: "Research Paper",
  repository: "GitHub Repository",
  tool: "Developer Tool",
  book: "Book & Reference",
};

/** Plural labels for section headings and filters. */
export const resourceTypePlural: Record<ResourceType, string> = {
  video: "YouTube videos",
  playlist: "YouTube playlists",
  article: "Articles & blogs",
  documentation: "Official documentation",
  course: "Courses",
  paper: "Research papers",
  repository: "GitHub repositories",
  tool: "Developer tools",
  book: "Books & references",
};

export const costLabel: Record<CostType, string> = {
  free: "Free",
  "free-audit": "Free to audit",
  freemium: "Free tier",
  paid: "Paid",
};

export const updateCategoryLabel: Record<UpdateCategory, string> = {
  "artificial-intelligence": "Artificial Intelligence",
  "software-development": "Software Development",
  cybersecurity: "Cybersecurity",
  "cloud-computing": "Cloud Computing",
  startups: "Startups",
  programming: "Programming",
  hardware: "Hardware",
  "emerging-technologies": "Emerging Technologies",
};

export const projectCategoryLabel: Record<ProjectCategory, string> = {
  web: "Web Development",
  mobile: "Mobile Development",
  ai: "Artificial Intelligence",
  "machine-learning": "Machine Learning",
  "data-science": "Data Science",
  devops: "DevOps",
  cybersecurity: "Cybersecurity",
  automation: "Automation",
};

/** Formats an ISO date as e.g. "24 Nov 2026". Returns null for missing or invalid dates. */
export function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Small, stable string hash (djb2) used for feed item ids. */
export function hashString(value: string): string {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

/** Returns the hostname without "www." for display, e.g. "react.dev". */
export function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Only allows internal relative redirects (prevents open-redirect attacks). */
export function safeRedirectPath(path: string | null | undefined, fallback = "/"): string {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) {
    return fallback;
  }
  return path;
}
