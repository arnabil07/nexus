import type { ReactNode } from "react";
import { cn, costLabel, difficultyLabel } from "@/lib/utils";
import type { CostType, Difficulty } from "@/types";

type Tone = "neutral" | "accent" | "outline";

const tones: Record<Tone, string> = {
  neutral: "bg-surface text-secondary border-border",
  accent: "bg-accent/10 text-accent border-accent/30",
  outline: "bg-transparent text-secondary border-border",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 font-mono text-[0.6875rem] leading-4 tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DifficultyBadge({ level }: { level: Difficulty }) {
  return <Badge>{difficultyLabel[level]}</Badge>;
}

export function CostBadge({ cost }: { cost: CostType }) {
  return <Badge tone={cost === "free" ? "accent" : "outline"}>{costLabel[cost]}</Badge>;
}

export function SampleBadge() {
  return (
    <Badge tone="outline" className="border-dashed">
      Sample
    </Badge>
  );
}
