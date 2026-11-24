import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/** Generates /robots.txt. Private and utility pages are excluded from indexing. */
export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url.replace(/\/$/, "");
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/account", "/auth/", "/library", "/search"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
