import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/layout/container";
import { PathsBrowser } from "@/components/paths/paths-browser";
import { getLearningPaths } from "@/lib/content";

export const metadata: Metadata = {
  title: "Learning paths",
  description: "Structured, step-by-step roadmaps for software, AI, data, cloud, DevOps, security and mobile careers.",
  alternates: { canonical: "/learning-paths" },
};

export default async function LearningPathsPage() {
  const paths = await getLearningPaths();
  return (
    <>
      <PageHeader
        eyebrow="Learning paths"
        title="Structured learning paths"
        description="Follow curated roadmaps stage by stage. Mark stages complete to track your progress."
      />
      <Container className="py-10 sm:py-12">
        <PathsBrowser paths={paths} />
      </Container>
    </>
  );
}
