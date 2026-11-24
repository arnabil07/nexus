"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ResourceRow } from "@/components/cards/cards";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/states";
import { normalise } from "@/lib/search";
import { costLabel, difficultyLabel, difficultyOrder, resourceTypePlural } from "@/lib/utils";
import type { Category, CostType, Difficulty, Resource, ResourceType, Topic } from "@/types";

type Sort = "recommended" | "title" | "difficulty-asc" | "difficulty-desc";

const PAGE_SIZE = 30;
const types = Object.keys(resourceTypePlural) as ResourceType[];
const difficulties: Difficulty[] = ["beginner", "intermediate", "advanced"];
const costs: CostType[] = ["free", "free-audit", "freemium", "paid"];

function pick<T extends string>(value: string | null, allowed: readonly T[]): T | "all" {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : "all";
}

/**
 * The searchable resource library. Filters are stored in the URL, so links such
 * as /resources?type=course open with the right filter applied.
 */
export function ResourceLibrary({
  resources,
  topics,
  categories,
}: {
  resources: Resource[];
  topics: Pick<Topic, "slug" | "title" | "category">[];
  categories: Category[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [query, setQuery] = useState(params.get("q") ?? "");
  const [type, setType] = useState(pick(params.get("type"), types));
  const [category, setCategory] = useState(pick(params.get("category"), categories.map((c) => c.slug)));
  const [topic, setTopic] = useState(params.get("topic") ?? "all");
  const [difficulty, setDifficulty] = useState(pick(params.get("difficulty"), difficulties));
  const [cost, setCost] = useState(pick(params.get("cost"), costs));
  const [sort, setSort] = useState<Sort>((params.get("sort") as Sort) || "recommended");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const topicCategory = useMemo(() => new Map(topics.map((t) => [t.slug, t.category])), [topics]);
  const topicOptions = category === "all" ? topics : topics.filter((t) => t.category === category);

  function sync(next: Record<string, string>) {
    const values: Record<string, string> = { q: query, type, category, topic, difficulty, cost, sort, ...next };
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(values)) {
      if (value && value !== "all" && !(key === "sort" && value === "recommended")) search.set(key, value.trim());
    }
    const qs = search.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    setVisible(PAGE_SIZE);
  }

  const filtered = useMemo(() => {
    const tokens = normalise(query).split(" ").filter(Boolean);
    const list = resources.filter((r) => {
      if (type !== "all" && r.type !== type) return false;
      if (difficulty !== "all" && r.difficulty !== difficulty) return false;
      if (cost !== "all" && r.cost !== cost) return false;
      if (topic !== "all" && !r.topics.includes(topic)) return false;
      if (category !== "all" && !r.topics.some((t) => topicCategory.get(t) === category)) return false;
      if (tokens.length) {
        const haystack = normalise(`${r.title} ${r.description} ${r.publisher} ${r.topics.join(" ")}`);
        if (!tokens.every((token) => haystack.includes(token))) return false;
      }
      return true;
    });
    if (sort === "title") return [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "difficulty-asc")
      return [...list].sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    if (sort === "difficulty-desc")
      return [...list].sort((a, b) => difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]);
    return list;
  }, [resources, query, type, difficulty, cost, topic, category, sort, topicCategory]);

  const activeFilters = [type, category, topic, difficulty, cost].filter((v) => v !== "all").length + (query ? 1 : 0);

  function reset() {
    setQuery("");
    setType("all");
    setCategory("all");
    setTopic("all");
    setDifficulty("all");
    setCost("all");
    setSort("recommended");
    setVisible(PAGE_SIZE);
    router.replace(pathname, { scroll: false });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
      <aside aria-label="Filters" className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <div>
          <Label htmlFor="res-type">Resource type</Label>
          <Select
            id="res-type"
            value={type}
            onChange={(e) => {
              const v = e.target.value as ResourceType | "all";
              setType(v);
              sync({ type: v });
            }}
          >
            <option value="all">All types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {resourceTypePlural[t]} ({resources.filter((r) => r.type === t).length})
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="res-category">Technology area</Label>
          <Select
            id="res-category"
            value={category}
            onChange={(e) => {
              const v = e.target.value as Category["slug"] | "all";
              setCategory(v);
              setTopic("all");
              sync({ category: v, topic: "all" });
            }}
          >
            <option value="all">All areas</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="res-topic">Topic</Label>
          <Select
            id="res-topic"
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              sync({ topic: e.target.value });
            }}
          >
            <option value="all">All topics</option>
            {topicOptions.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.title}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="res-difficulty">Difficulty</Label>
          <Select
            id="res-difficulty"
            value={difficulty}
            onChange={(e) => {
              const v = e.target.value as Difficulty | "all";
              setDifficulty(v);
              sync({ difficulty: v });
            }}
          >
            <option value="all">Any difficulty</option>
            {difficulties.map((d) => (
              <option key={d} value={d}>
                {difficultyLabel[d]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="res-cost">Cost</Label>
          <Select
            id="res-cost"
            value={cost}
            onChange={(e) => {
              const v = e.target.value as CostType | "all";
              setCost(v);
              sync({ cost: v });
            }}
          >
            <option value="all">Any cost</option>
            {costs.map((c) => (
              <option key={c} value={c}>
                {costLabel[c]}
              </option>
            ))}
          </Select>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            “Free to audit” means the course content is free but certificates are paid.
          </p>
        </div>
        {activeFilters > 0 && (
          <Button variant="ghost" size="sm" onClick={reset} className="w-full">
            <X aria-hidden="true" /> Clear all filters
          </Button>
        )}
      </aside>

      <div className="min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <label htmlFor="res-search" className="sr-only">
              Search resources
            </label>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              id="res-search"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                sync({ q: e.target.value });
              }}
              placeholder="Search by title, publisher or topic…"
              className="h-10 w-full rounded-md border border-border bg-surface pl-10 pr-3 text-sm text-foreground placeholder:text-muted focus:border-muted focus:outline-none"
            />
          </div>
          <label htmlFor="res-sort" className="sr-only">
            Sort resources
          </label>
          <Select
            id="res-sort"
            value={sort}
            onChange={(e) => {
              const v = e.target.value as Sort;
              setSort(v);
              sync({ sort: v });
            }}
            className="sm:w-52"
          >
            <option value="recommended">Sort: Recommended</option>
            <option value="title">Sort: Title A–Z</option>
            <option value="difficulty-asc">Sort: Easiest first</option>
            <option value="difficulty-desc">Sort: Hardest first</option>
          </Select>
        </div>

        <p className="mt-5 font-mono text-xs text-muted" aria-live="polite">
          {filtered.length} of {resources.length} resources
        </p>

        {filtered.length === 0 ? (
          <EmptyState
            className="mt-5"
            title="No resources match these filters"
            description="Try removing a filter or searching for a broader term."
            action={
              <Button variant="secondary" onClick={reset}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            <div className="mt-5 grid gap-3">
              {filtered.slice(0, visible).map((resource) => (
                <ResourceRow key={resource.id} resource={resource} />
              ))}
            </div>
            {visible < filtered.length && (
              <div className="mt-8 text-center">
                <Button variant="secondary" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                  Show more ({filtered.length - visible} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
