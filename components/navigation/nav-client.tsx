"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Menu, Search, User, X } from "lucide-react";
import { useRef } from "react";
import { mainNav } from "@/config/site";
import { useLibrary } from "@/lib/library/store";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

export const OPEN_SEARCH_EVENT = "nexus:open-search";

export function openSearch() {
  window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`) || (href === "/explore" && pathname.startsWith("/topics"));
}

/** Desktop navigation links with the orange active indicator. */
export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="hidden h-full items-center gap-7 lg:flex">
      {mainNav.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex h-full items-center text-sm transition-colors",
              active ? "text-foreground" : "text-secondary hover:text-foreground",
            )}
          >
            {item.title}
            {active && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-accent" aria-hidden="true" />}
          </Link>
        );
      })}
    </nav>
  );
}

/** Search button that opens the ⌘K command menu. */
export function SearchButton() {
  return (
    <button
      type="button"
      onClick={openSearch}
      className="flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-sm text-muted transition-colors hover:border-muted hover:text-foreground sm:w-52"
      aria-label="Search NEXUS"
    >
      <Search className="size-4" aria-hidden="true" />
      <span className="hidden flex-1 text-left sm:inline">Search…</span>
      <kbd className="hidden rounded-sm border border-border px-1.5 font-mono text-[0.625rem] text-muted sm:inline">⌘K</kbd>
    </button>
  );
}

/** Library + account shortcuts. Shows "Sign in" only when accounts are enabled. */
export function UserNav() {
  const { user, accountsEnabled } = useLibrary();
  return (
    <div className="hidden items-center gap-1 lg:flex">
      <Link
        href="/library"
        className="flex size-9 items-center justify-center rounded-md text-secondary hover:bg-card hover:text-foreground"
        aria-label="Your library"
        title="Your library"
      >
        <Bookmark className="size-4" aria-hidden="true" />
      </Link>
      {accountsEnabled &&
        (user ? (
          <Link
            href="/account"
            className="flex size-9 items-center justify-center rounded-md text-secondary hover:bg-card hover:text-foreground"
            aria-label="Your account"
            title={user.email ?? "Your account"}
          >
            <User className="size-4" aria-hidden="true" />
          </Link>
        ) : (
          <Link href="/auth/login" className="ml-1 px-2 text-sm text-secondary hover:text-foreground">
            Sign in
          </Link>
        ))}
    </div>
  );
}

/** Mobile menu: a native <dialog>, which gives focus trapping and Esc-to-close for free. */
export function MobileNav() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const { user, accountsEnabled } = useLibrary();
  const close = () => dialogRef.current?.close();

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="flex size-9 items-center justify-center rounded-md text-secondary hover:bg-card hover:text-foreground"
        aria-label="Open menu"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>
      <dialog
        ref={dialogRef}
        aria-label="Menu"
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
        className="m-0 ml-auto h-dvh max-h-dvh w-[min(20rem,85vw)] max-w-none border-l border-border bg-background p-0 text-foreground"
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Logo />
          <button
            type="button"
            onClick={close}
            className="flex size-9 items-center justify-center rounded-md text-secondary hover:bg-card hover:text-foreground"
            aria-label="Close menu"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Mobile" className="flex flex-col p-3">
          {mainNav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-3 text-[0.9375rem]",
                  active ? "bg-card text-foreground" : "text-secondary hover:bg-card hover:text-foreground",
                )}
              >
                {item.title}
                {active && <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />}
              </Link>
            );
          })}
          <div className="my-3 h-px bg-border" />
          <button
            type="button"
            onClick={() => {
              close();
              openSearch();
            }}
            className="flex items-center gap-3 rounded-md px-3 py-3 text-left text-[0.9375rem] text-secondary hover:bg-card hover:text-foreground"
          >
            <Search className="size-4" aria-hidden="true" /> Search
          </button>
          <Link
            href="/library"
            onClick={close}
            className="flex items-center gap-3 rounded-md px-3 py-3 text-[0.9375rem] text-secondary hover:bg-card hover:text-foreground"
          >
            <Bookmark className="size-4" aria-hidden="true" /> Your library
          </Link>
          {accountsEnabled && (
            <Link
              href={user ? "/account" : "/auth/login"}
              onClick={close}
              className="flex items-center gap-3 rounded-md px-3 py-3 text-[0.9375rem] text-secondary hover:bg-card hover:text-foreground"
            >
              <User className="size-4" aria-hidden="true" /> {user ? "Account" : "Sign in"}
            </Link>
          )}
        </nav>
      </dialog>
    </div>
  );
}
