import type { UpdateCategory } from "@/types";

/**
 * Public RSS/Atom feeds used for Tech Updates. No API keys are needed.
 * Each item keeps its original publisher, date and link.
 *
 * To add a source: add an entry here. If a feed fails, the others still work
 * and the page shows which sources were unavailable.
 */

export interface FeedSource {
  id: string;
  /** Publisher name shown on cards. */
  name: string;
  url: string;
  category: UpdateCategory;
  /** How many items to keep from this feed. */
  limit?: number;
}

export const feedSources: FeedSource[] = [
  { id: "huggingface", name: "Hugging Face Blog", url: "https://huggingface.co/blog/feed.xml", category: "artificial-intelligence" },
  { id: "mit-tr", name: "MIT Technology Review", url: "https://www.technologyreview.com/feed/", category: "emerging-technologies" },
  { id: "github-blog", name: "The GitHub Blog", url: "https://github.blog/feed/", category: "software-development" },
  { id: "stackoverflow-blog", name: "Stack Overflow Blog", url: "https://stackoverflow.blog/feed/", category: "software-development" },
  { id: "krebs", name: "Krebs on Security", url: "https://krebsonsecurity.com/feed/", category: "cybersecurity" },
  { id: "schneier", name: "Schneier on Security", url: "https://www.schneier.com/feed/atom/", category: "cybersecurity" },
  { id: "aws-news", name: "AWS News Blog", url: "https://aws.amazon.com/blogs/aws/feed/", category: "cloud-computing" },
  { id: "kubernetes", name: "Kubernetes Blog", url: "https://kubernetes.io/feed.xml", category: "cloud-computing" },
  { id: "cloudflare", name: "The Cloudflare Blog", url: "https://blog.cloudflare.com/rss/", category: "cloud-computing" },
  { id: "techcrunch-startups", name: "TechCrunch Startups", url: "https://techcrunch.com/category/startups/feed/", category: "startups" },
  { id: "go-blog", name: "The Go Blog", url: "https://go.dev/blog/feed.atom", category: "programming" },
  { id: "rust-blog", name: "Rust Blog", url: "https://blog.rust-lang.org/feed.xml", category: "programming" },
  { id: "typescript-blog", name: "TypeScript Blog", url: "https://devblogs.microsoft.com/typescript/feed/", category: "programming" },
  { id: "toms-hardware", name: "Tom's Hardware", url: "https://www.tomshardware.com/feeds/all", category: "hardware" },
];

/** Seconds between feed refreshes (Next.js incremental static regeneration). */
export const FEED_REVALIDATE_SECONDS = 3600;
