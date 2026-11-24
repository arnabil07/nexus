import Link from "next/link";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/navigation/logo";
import { Notice } from "@/components/ui/states";

/** Centred card layout shared by sign-in, sign-up and password pages. */
export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex justify-center px-5 py-16 sm:py-24">
      <div className="w-full max-w-sm">
        <LogoMark className="mb-6 size-8" />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-2 text-sm text-secondary">{description}</p>}
        <div className="mt-8">{children}</div>
        {footer && <div className="mt-6 text-sm text-secondary">{footer}</div>}
      </div>
    </div>
  );
}

/** Shown instead of forms when Supabase keys haven't been added yet. */
export function AuthNotConfigured() {
  return (
    <Notice>
      Accounts aren&apos;t enabled on this site yet. Your bookmarks and progress still work and are saved in this
      browser. <Link href="/library">Open your library</Link>.
      <span className="mt-2 block text-xs text-muted">
        Site owner: add your Supabase keys to enable accounts (see SUPABASE_SETUP.md).
      </span>
    </Notice>
  );
}
