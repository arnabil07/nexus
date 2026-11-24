import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-start py-24 sm:py-32">
      <p className="eyebrow mb-4">&#47;&#47; Error 404</p>
      <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Page not found.</h1>
      <p className="mt-4 max-w-lg text-lg text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or has moved. Try searching, or start from one of these.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/">Go home</ButtonLink>
        <ButtonLink href="/explore" variant="secondary">
          Explore topics
        </ButtonLink>
        <ButtonLink href="/search" variant="ghost">
          Search
        </ButtonLink>
      </div>
      <p className="mt-10 text-sm text-muted">
        Think this is a broken link?{" "}
        <a href={`mailto:${siteConfig.contactEmail}`} className="text-accent hover:text-accent-hover">
          Let us know
        </a>
        .
      </p>
    </Container>
  );
}
