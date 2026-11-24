"use client";

import { useState } from "react";
import { ProjectCard } from "@/components/cards/cards";
import { FilterChips } from "@/components/ui/filter-chips";
import { EmptyState } from "@/components/ui/states";
import { difficultyLabel, projectCategoryLabel } from "@/lib/utils";
import type { Difficulty, Project, ProjectCategory } from "@/types";

const levels: Difficulty[] = ["beginner", "intermediate", "advanced"];

/** Project library, organised by difficulty with a category filter. */
export function ProjectsBrowser({ projects }: { projects: Project[] }) {
  const [category, setCategory] = useState<ProjectCategory | "all">("all");
  const [level, setLevel] = useState<Difficulty | "all">("all");
  const categories = Object.keys(projectCategoryLabel) as ProjectCategory[];

  const filtered = projects.filter(
    (p) => (category === "all" || p.category === category) && (level === "all" || p.difficulty === level),
  );

  return (
    <div>
      <div className="space-y-3">
        <FilterChips
          label="Filter by category"
          value={category}
          onChange={setCategory}
          options={[
            { value: "all", label: "All categories" },
            ...categories.map((c) => ({ value: c, label: projectCategoryLabel[c] })),
          ]}
        />
        <FilterChips
          label="Filter by difficulty"
          value={level}
          onChange={setLevel}
          options={[{ value: "all", label: "All levels" }, ...levels.map((l) => ({ value: l, label: difficultyLabel[l] }))]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No projects match these filters"
          description="Try another category or difficulty level."
        />
      ) : (
        <div className="mt-10 space-y-12">
          {levels
            .filter((l) => filtered.some((p) => p.difficulty === l))
            .map((l) => (
              <section key={l} aria-labelledby={`level-${l}`}>
                <h2 id={`level-${l}`} className="mb-4 flex items-baseline gap-3 border-b border-border pb-3 text-lg font-semibold text-foreground">
                  {difficultyLabel[l]}
                  <span className="font-mono text-xs font-normal text-muted">
                    {filtered.filter((p) => p.difficulty === l).length} projects
                  </span>
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered
                    .filter((p) => p.difficulty === l)
                    .map((project) => (
                      <ProjectCard key={project.slug} project={project} />
                    ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}
