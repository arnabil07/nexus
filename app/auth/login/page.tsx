import type { Metadata } from "next";
import Link from "next/link";
import { AuthNotConfigured, AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/auth-forms";
import { Notice } from "@/components/ui/states";
import { isSupabaseConfigured } from "@/lib/env";
import { safeRedirectPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <AuthShell
      title="Sign in"
      description="Sign in to sync your bookmarks and learning progress across devices."
      footer={
        configured && (
          <>
            New to NEXUS?{" "}
            <Link href="/auth/register" className="text-accent hover:text-accent-hover">
              Create an account
            </Link>
          </>
        )
      }
    >
      {!configured ? (
        <AuthNotConfigured />
      ) : (
        <>
          {error === "link" && (
            <Notice className="mb-5">That link is invalid or has expired. Please sign in or request a new link.</Notice>
          )}
          <LoginForm next={safeRedirectPath(next, "/account")} />
        </>
      )}
    </AuthShell>
  );
}
