import type { Category } from "@/types";

export const categories: Category[] = [
  {
    slug: "software-development",
    title: "Software Development",
    description: "Programming, web and mobile apps, architecture and the craft of building software.",
    icon: "code",
  },
  {
    slug: "artificial-intelligence",
    title: "Artificial Intelligence",
    description: "From classic machine learning to deep learning, LLMs and AI agents.",
    icon: "brain",
  },
  {
    slug: "cloud-infrastructure",
    title: "Cloud & Infrastructure",
    description: "Cloud platforms, containers, automation and operating systems at scale.",
    icon: "cloud",
  },
  {
    slug: "data",
    title: "Data",
    description: "Analysing, storing, moving and making sense of data.",
    icon: "database",
  },
  {
    slug: "security-networking",
    title: "Security & Networking",
    description: "How networks work and how to keep systems and people safe.",
    icon: "shield",
  },
  {
    slug: "emerging-technologies",
    title: "Emerging Technologies",
    description: "Blockchain, IoT, quantum computing, robotics and immersive tech.",
    icon: "atom",
  },
];
