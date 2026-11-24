import {
  Atom,
  Blocks,
  Bot,
  Boxes,
  Brain,
  Cloud,
  Code,
  Container,
  Cpu,
  Database,
  Eye,
  Gauge,
  Glasses,
  Globe,
  KeyRound,
  Layers,
  Lock,
  MessageSquare,
  Network,
  Rocket,
  Route,
  Server,
  Shield,
  Smartphone,
  Sparkles,
  Terminal,
  TrendingUp,
  Wifi,
  Workflow,
  Wrench,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import type { IconName } from "@/types";

/**
 * Every content icon in NEXUS is resolved here, so the whole site uses one
 * consistent set. Data files refer to icons by name (e.g. "brain").
 * Lucide v1 removed brand icons, so brand marks (like GitHub) are custom SVGs below.
 */
export const iconMap: Record<IconName, LucideIcon> = {
  code: Code,
  brain: Brain,
  cloud: Cloud,
  database: Database,
  shield: Shield,
  atom: Atom,
  globe: Globe,
  smartphone: Smartphone,
  server: Server,
  layers: Layers,
  network: Network,
  cpu: Cpu,
  bot: Bot,
  sparkles: Sparkles,
  eye: Eye,
  container: Container,
  workflow: Workflow,
  lock: Lock,
  terminal: Terminal,
  chart: TrendingUp,
  blocks: Blocks,
  wifi: Wifi,
  glasses: Glasses,
  rocket: Rocket,
  route: Route,
  wrench: Wrench,
  gauge: Gauge,
  key: KeyRound,
  boxes: Boxes,
  message: MessageSquare,
};

export function ContentIcon({ name, ...props }: { name: IconName } & LucideProps) {
  const Icon = iconMap[name] ?? Code;
  return <Icon aria-hidden="true" {...props} />;
}

/** GitHub mark as a simple inline SVG (brand icons aren't in Lucide v1). */
export function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}
