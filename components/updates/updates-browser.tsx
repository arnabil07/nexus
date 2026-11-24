"use client";

import { useState } from "react";
import { UpdateCard } from "@/components/cards/cards";
import { Button } from "@/components/ui/button";
import { FilterChips } from "@/components/ui/filter-chips";
import { EmptyState } from "@/components/ui/states";
import { updateCategoryLabel } from "@/lib/utils";
import type { TechUpdate, UpdateCategory } from "@/types";

const PAGE_SIZE = 24;

/** Category filter for tech updates. Items arrive already sorted newest first. */
export function UpdatesBrowser({ updates }: { updates: TechUpdate[] }) {
  const [category, setCategory] = useState<UpdateCategory | "all">("all");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const categories = Object.keys(updateCategoryLabel) as UpdateCategory[];
  const filtered = category === "all" ? updates : updates.filter((u) => u.category === category);

  return (
    <div>
      <FilterChips
        label="Filter by category"
        value={category}
        onChange={(value) => {
          setCategory(value);
          setVisible(PAGE_SIZE);
        }}
        options={[
          { value: "all", label: "All", count: updates.length },
          ...categories.map((c) => ({
            value: c,
            label: updateCategoryLabel[c],
            count: updates.filter((u) => u.category === c).length,
          })),
        ]}
      />
      {filtered.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No updates in this category right now"
          description="Feeds refresh every hour. Try another category."
        />
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.slice(0, visible).map((update) => (
              <UpdateCard key={update.id} update={update} />
            ))}
          </div>
          {visible < filtered.length && (
            <div className="mt-8 text-center">
              <Button variant="secondary" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                Show more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
