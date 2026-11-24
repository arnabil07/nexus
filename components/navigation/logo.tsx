import Link from "next/link";
import { cn } from "@/lib/utils";

/** The NEXUS mark: a stylised, slanted "N" in the accent colour. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={cn("size-7", className)}>
      <path
        d="M5.5 26 10 6l11.5 20L26 6"
        stroke="var(--color-accent)"
        strokeWidth="3.6"
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)} aria-label="NEXUS home">
      <LogoMark />
      <span className="text-lg font-semibold tracking-[0.08em] text-foreground">NEXUS</span>
    </Link>
  );
}
