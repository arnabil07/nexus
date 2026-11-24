/**
 * Shared TypeScript types for all NEXUS content.
 * Every data file in /data and every database row is mapped to these shapes,
 * so components never need to know where the content came from.
 */

export type Difficulty = "beginner" | "intermediate" | "advanced";

/** Icon names come from components/icons.ts so every icon is used consistently. */
export type IconName =
  | "code"
  | "brain"
  | "cloud"
  | "database"
  | "shield"
  | "atom"
  | "globe"
  | "smartphone"
  | "server"
  | "layers"
  | "network"
  | "cpu"
  | "bot"
  | "sparkles"
  | "eye"
  | "container"
  | "workflow"
  | "lock"
  | "terminal"
  | "chart"
  | "blocks"
  | "wifi"
  | "glasses"
  | "rocket"
  | "route"
  | "wrench"
  | "gauge"
  | "key"
  | "boxes"
  | "message";

/* ── Explore ─────────────────────────────────────────────── */

export type CategorySlug =
  | "software-development"
  | "artificial-intelligence"
  | "cloud-infrastructure"
  | "data"
  | "security-networking"
  | "emerging-technologies";

export interface Category {
  slug: CategorySlug;
  title: string;
  description: string;
  icon: IconName;
}

export interface ConceptItem {
  title: string;
  description: string;
}

export interface Topic {
  slug: string;
  title: string;
  category: CategorySlug;
  icon: IconName;
  /** One short line used on cards. */
  summary: string;
  level: Difficulty;
  beginnerFriendly: boolean;
  /** Shown in "Popular topics" lists. */
  popular?: boolean;
  introduction: string;
  whatYouWillLearn: string[];
  applications: string[];
  prerequisites: string[];
  coreConcepts: ConceptItem[];
  roadmap: ConceptItem[];
  /** Slugs of related topics. */
  related: string[];
}

/* ── Resources ───────────────────────────────────────────── */

export type ResourceType =
  | "video"
  | "playlist"
  | "article"
  | "documentation"
  | "course"
  | "paper"
  | "repository"
  | "tool"
  | "book";

/**
 * free       – completely free to access
 * free-audit – course content free to audit; certificate costs money
 * freemium   – useful free tier, some content or features are paid
 * paid       – requires payment
 */
export type CostType = "free" | "free-audit" | "freemium" | "paid";

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  /** Organisation or author that publishes the resource. */
  publisher: string;
  url: string;
  /** Topic slugs this resource belongs to. */
  topics: string[];
  difficulty: Difficulty;
  cost: CostType;
  /** Optional clarification, e.g. "Certificate is paid". */
  costNote?: string;
  language: string;
  /** Authors and year, used for research papers. */
  citation?: string;
  /** Date the resource was added to NEXUS (YYYY-MM-DD). */
  addedAt: string;
  /** True once the link was checked by a person or the link checker. */
  verified: boolean;
}

/* ── Learning paths ──────────────────────────────────────── */

export interface LearningStage {
  /** Unique within its path, e.g. "html-css". */
  id: string;
  title: string;
  description: string;
  skills: string[];
  /** Resource ids from data/resources.ts. */
  resources: string[];
  /** A small practical exercise for this stage. */
  exercise: string;
  /** Optional project slug from data/projects.ts. */
  project?: string;
}

export interface LearningPath {
  slug: string;
  title: string;
  description: string;
  icon: IconName;
  difficulty: Difficulty;
  /** Human readable, e.g. "6–9 months part-time". */
  duration: string;
  outcome: string;
  skills: string[];
  stages: LearningStage[];
  featured?: boolean;
}

/* ── Projects ────────────────────────────────────────────── */

export type ProjectCategory =
  | "web"
  | "mobile"
  | "ai"
  | "machine-learning"
  | "data-science"
  | "devops"
  | "cybersecurity"
  | "automation";

export interface Project {
  slug: string;
  title: string;
  category: ProjectCategory;
  difficulty: Difficulty;
  duration: string;
  description: string;
  technologies: string[];
  skills: string[];
  requirements: string[];
  steps: ConceptItem[];
  outcome: string;
  topics: string[];
  /** Resource ids that help with this project. */
  resources: string[];
  /** Only set when a real, verified repository exists. */
  githubUrl?: string;
  featured?: boolean;
}

/* ── Tech updates ────────────────────────────────────────── */

export type UpdateCategory =
  | "artificial-intelligence"
  | "software-development"
  | "cybersecurity"
  | "cloud-computing"
  | "startups"
  | "programming"
  | "hardware"
  | "emerging-technologies";

export interface TechUpdate {
  id: string;
  title: string;
  summary: string;
  category: UpdateCategory;
  /** Publisher name, e.g. "Kubernetes Blog". */
  source: string;
  /** ISO date string. Null for sample items, which never carry fake dates. */
  publishedAt: string | null;
  /** Link to the original article. Null for sample items. */
  url: string | null;
  /** True for illustrative sample content. Always labelled in the UI. */
  isSample: boolean;
}

export interface UpdatesResult {
  items: TechUpdate[];
  mode: "live" | "sample";
  failedSources: string[];
}

/* ── Search ──────────────────────────────────────────────── */

export type SearchItemType = "topic" | "resource" | "path" | "project" | "update";

export interface SearchItem {
  id: string;
  type: SearchItemType;
  title: string;
  description: string;
  /** Internal path or external URL. */
  href: string;
  external: boolean;
  /** Short label shown next to the result, e.g. "Documentation · MDN". */
  meta: string;
  keywords: string[];
}

/* ── Library (bookmarks + progress) ──────────────────────── */

export type BookmarkType = "topic" | "resource" | "path" | "project";
