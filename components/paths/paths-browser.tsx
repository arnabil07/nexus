"use client";

import { useState } from "react";
import { PathCard } from "@/components/cards/cards";
import { FilterChips } from "@/components/ui/filter-chips";
import { EmptyState } from "@/components/ui/states";
import { difficultyLabel } from "@/lib/utils";
import type { Difficulty, LearningPath } from "@/types";

export function PathsBrowser({ paths }: { paths: LearningPath[] }) {
  const [level, setLevel] = useState<Difficulty | "all">("all");
  const filtered = level === "all" ? paths : paths.filter((p) => p.difficulty === level);
  const levels: Difficulty[] = ["beginner", "intermediate", "advanced"];

  return (
    <div>
      <FilterChips
        label="Filter by difficulty"
        value={level}
        onChange={setLevel}
        options={[
          { value: "all", label: "All", count: paths.length },
          ...levels.map((l) => ({ value: l, label: difficultyLabel[l], count: paths.filter((p) => p.difficulty === l).length })),
        ]}
      />
      {filtered.length === 0 ? (
        <EmptyState className="mt-8" title="No learning paths at this level yet" />
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((path) => (
            <PathCard key={path.slug} path={path} />
          ))}
        </div>
      )}
    </div>
  );
}
