import type { Metadata } from "next";
import Link from "next/link";
import { AuthNotConfigured, AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/auth-forms";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default function RegisterPage() {
  const configured = isSupabaseConfigured();
  return (
    <AuthShell
      title="Create your account"
      description="Free forever. Save resources and track your learning progress."
      footer={
        configured && (
          <>
            Already have an account?{" "}
            <Link href="/auth/login" className="text-accent hover:text-accent-hover">
              Sign in
            </Link>
          </>
        )
      }
    >
      {configured ? <RegisterForm /> : <AuthNotConfigured />}
    </AuthShell>
  );
}
