import type { Metadata } from "next";
import Link from "next/link";
import { AuthNotConfigured, AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/auth-forms";
import { Notice } from "@/components/ui/states";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

/** Users arrive here from the reset email (via /auth/callback, which signs them in). */
export default async function ResetPasswordPage() {
  if (!isSupabaseConfigured()) {
    return (
      <AuthShell title="Choose a new password">
        <AuthNotConfigured />
      </AuthShell>
    );
  }
  const user = await getCurrentUser();
  return (
    <AuthShell title="Choose a new password" description={user?.email ? `For ${user.email}` : undefined}>
      {user ? (
        <ResetPasswordForm />
      ) : (
        <Notice>
          This page only works from a password reset link, and yours may have expired.{" "}
          <Link href="/auth/forgot-password">Request a new link</Link>.
        </Notice>
      )}
    </AuthShell>
  );
}
