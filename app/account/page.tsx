import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, LogOut } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";
import { AuthNotConfigured, AuthShell } from "@/components/auth/auth-shell";
import { ProfileForm } from "@/components/auth/auth-forms";
import { Container, PageHeader } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/states";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabase } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

type Props = { searchParams: Promise<{ updated?: string }> };

/** Protected page: proxy.ts redirects signed-out users, and we double-check here. */
export default async function AccountPage({ searchParams }: Props) {
  if (!isSupabaseConfigured()) {
    return (
      <AuthShell title="Your account">
        <AuthNotConfigured />
      </AuthShell>
    );
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  if (!supabase || !user) redirect("/auth/login?next=/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, created_at")
    .eq("id", user.id)
    .maybeSingle<{ display_name: string | null; created_at: string }>();

  const { updated } = await searchParams;
  const displayName = profile?.display_name ?? (user.user_metadata?.display_name as string | undefined) ?? "";

  return (
    <>
      <PageHeader eyebrow="Account" title={displayName ? `Hi, ${displayName}` : "Your account"} />
      <Container className="grid max-w-5xl gap-8 py-10 md:grid-cols-2">
        {updated === "password" && <Notice className="md:col-span-2">Your password has been updated.</Notice>}

        <section className="rounded-md border border-border bg-card p-6" aria-labelledby="profile-title">
          <h2 id="profile-title" className="mb-1 text-lg font-semibold text-foreground">
            Profile
          </h2>
          <p className="mb-6 text-sm text-secondary">
            {user.email}
            {profile?.created_at && ` · Member since ${formatDate(profile.created_at)}`}
          </p>
          <ProfileForm displayName={displayName} />
        </section>

        <section className="flex flex-col rounded-md border border-border bg-card p-6" aria-labelledby="library-title">
          <h2 id="library-title" className="mb-1 text-lg font-semibold text-foreground">
            Library & progress
          </h2>
          <p className="mb-6 text-sm text-secondary">
            Your bookmarks and learning progress are saved to your account and sync across devices.
          </p>
          <Link
            href="/library"
            className="group flex items-center justify-between rounded-md border border-border bg-surface p-4 hover:border-muted"
          >
            <span className="text-foreground">Open your library</span>
            <ArrowRight className="size-4 text-accent transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <div className="mt-auto flex flex-wrap gap-3 pt-8">
            <Link href="/auth/reset-password" className="text-sm text-accent hover:text-accent-hover">
              Change password
            </Link>
          </div>
          <form action={signOutAction} className="mt-4">
            <Button type="submit" variant="secondary">
              <LogOut aria-hidden="true" /> Sign out
            </Button>
          </form>
        </section>
      </Container>
    </>
  );
}
