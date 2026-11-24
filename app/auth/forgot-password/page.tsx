import type { Metadata } from "next";
import Link from "next/link";
import { AuthNotConfigured, AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false } };

export default function ForgotPasswordPage() {
  const configured = isSupabaseConfigured();
  return (
    <AuthShell
      title="Reset your password"
      description="Enter your email and we'll send you a link to choose a new password."
      footer={
        <Link href="/auth/login" className="text-accent hover:text-accent-hover">
          ← Back to sign in
        </Link>
      }
    >
      {configured ? <ForgotPasswordForm /> : <AuthNotConfigured />}
    </AuthShell>
  );
}
