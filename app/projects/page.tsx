import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/layout/container";
import { ProjectsBrowser } from "@/components/projects/projects-browser";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  description: "Practical project briefs for web, mobile, AI, machine learning, data science, DevOps, cybersecurity and automation.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Build real-world projects"
        description="Practise what you learn with step-by-step project briefs, organised from beginner to advanced."
      />
      <Container className="py-10 sm:py-12">
        <ProjectsBrowser projects={projects} />
      </Container>
    </>
  );
}
