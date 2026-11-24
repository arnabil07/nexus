"use client";

import { useEffect } from "react";
import { Container } from "@/components/layout/container";
import { Button, ButtonLink } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";

/** Shown when a page throws an unexpected error. `reset` re-renders the page. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-24">
      <ErrorState
        title="Something went wrong"
        description="An unexpected error stopped this page from loading. You can try again, or go back home."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={reset}>Try again</Button>
            <ButtonLink href="/" variant="secondary">
              Go home
            </ButtonLink>
          </div>
        }
      />
      {error.digest && <p className="mt-4 text-center font-mono text-xs text-muted">Error reference: {error.digest}</p>}
    </Container>
  );
}
