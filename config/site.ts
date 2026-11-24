/**
 * Site-wide settings. Edit navigation, footer links and contact details here
 * instead of inside components.
 */

export const siteConfig = {
  name: "NEXUS",
  tagline: "Explore. Learn. Build.",
  description:
    "A free technology knowledge and learning platform. Explore software engineering, artificial intelligence, cloud computing and more, with curated resources, learning paths and practical projects.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  // Update these with your real details before deploying.
  contactEmail: "hello@example.com",
  githubUrl: "https://github.com/",
} as const;

export interface NavItem {
  title: string;
  href: string;
}

export const mainNav: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "Explore", href: "/explore" },
  { title: "Learning Paths", href: "/learning-paths" },
  { title: "Resources", href: "/resources" },
  { title: "Updates", href: "/updates" },
  { title: "Projects", href: "/projects" },
];

export const footerNav: { title: string; links: NavItem[] }[] = [
  {
    title: "Platform",
    links: [
      { title: "Explore topics", href: "/explore" },
      { title: "Learning paths", href: "/learning-paths" },
      { title: "Projects", href: "/projects" },
      { title: "Tech updates", href: "/updates" },
      { title: "Search", href: "/search" },
    ],
  },
  {
    title: "Resources",
    links: [
      { title: "Courses", href: "/resources?type=course" },
      { title: "Documentation", href: "/resources?type=documentation" },
      { title: "YouTube", href: "/resources?type=video" },
      { title: "Research papers", href: "/resources?type=paper" },
      { title: "GitHub repositories", href: "/resources?type=repository" },
    ],
  },
  {
    title: "You",
    links: [
      { title: "Your library", href: "/library" },
      { title: "Account", href: "/account" },
      { title: "Sign in", href: "/auth/login" },
    ],
  },
];
