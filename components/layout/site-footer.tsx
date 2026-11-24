import Link from "next/link";
import { Mail } from "lucide-react";
import { GitHubMark } from "@/components/icons";
import { Logo } from "@/components/navigation/logo";
import { ExternalLink } from "@/components/ui/external-link";
import { footerNav, siteConfig } from "@/config/site";
import { Container } from "./container";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-secondary">
            A free technology knowledge platform that organises the best learning resources into topics, paths and
            projects.
          </p>
          <p className="eyebrow mt-5">{siteConfig.tagline}</p>
          <div className="mt-5 flex items-center gap-2">
            <ExternalLink
              href={siteConfig.githubUrl}
              className="flex size-9 items-center justify-center rounded-md border border-border text-secondary hover:border-muted hover:text-foreground"
              aria-label="NEXUS on GitHub"
            >
              <GitHubMark className="size-4" />
            </ExternalLink>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="flex size-9 items-center justify-center rounded-md border border-border text-secondary hover:border-muted hover:text-foreground"
              aria-label="Email NEXUS"
            >
              <Mail className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
        {footerNav.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-muted">{group.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-secondary hover:text-foreground">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <Container className="flex flex-col gap-2 border-t border-border py-6 text-xs text-muted sm:flex-row sm:justify-between">
        <p>© {year} NEXUS. Resources belong to their original publishers.</p>
        <p>
          Contact:{" "}
          <a href={`mailto:${siteConfig.contactEmail}`} className="hover:text-foreground">
            {siteConfig.contactEmail}
          </a>
        </p>
      </Container>
    </footer>
  );
}
