import type { ReactNode } from "react";

/** A numbered section on topic and project pages: "01 / Introduction". */
export function NumberedSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 border-b border-border py-10 first:pt-0 last:border-b-0">
      <h2 id={`${id}-title`} className="mb-5 text-xl font-semibold tracking-tight text-foreground">
        <span className="font-mono text-base text-muted">{String(number).padStart(2, "0")}</span>
        <span className="mx-2 text-accent">/</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** "On this page" navigation shown beside long pages. */
export function TableOfContents({ items }: { items: { id: string; title: string }[] }) {
  return (
    <nav aria-label="On this page" className="lg:sticky lg:top-24">
      <p className="mb-3 text-sm font-semibold text-foreground">On this page</p>
      <ol className="space-y-1.5 border-l border-border">
        {items.map((item, index) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="-ml-px flex gap-2.5 border-l border-transparent py-0.5 pl-4 text-sm text-secondary hover:border-accent hover:text-foreground"
            >
              <span className="font-mono text-xs leading-5 text-muted">{String(index + 1).padStart(2, "0")}</span>
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Bulleted list with small orange markers. */
export function DotList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-secondary">
          <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Ordered steps used for roadmaps and project implementation guides. */
export function StepList({ steps }: { steps: { title: string; description: string }[] }) {
  return (
    <ol className="relative space-y-6 border-l border-border pl-7">
      {steps.map((step, index) => (
        <li key={step.title} className="relative">
          <span
            className="absolute -left-[2.35rem] flex size-6 items-center justify-center rounded-full border border-border bg-background font-mono text-[0.6875rem] text-accent"
            aria-hidden="true"
          >
            {index + 1}
          </span>
          <h3 className="font-medium text-foreground">{step.title}</h3>
          <p className="mt-1 leading-relaxed text-secondary">{step.description}</p>
        </li>
      ))}
    </ol>
  );
}
