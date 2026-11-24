import { Logo } from "@/components/navigation/logo";
import { DesktopNav, MobileNav, SearchButton, UserNav } from "@/components/navigation/nav-client";
import { Container } from "./container";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Logo />
        <DesktopNav />
        <div className="flex items-center gap-2">
          <SearchButton />
          <UserNav />
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
