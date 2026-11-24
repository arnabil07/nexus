"use server";

import { redirect } from "next/navigation";
import { siteConfig } from "@/config/site";
import { createServerSupabase } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/utils";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  toFieldErrors,
  type FormState,
} from "@/lib/validation/auth";

/**
 * Server actions for authentication. They run only on the server, validate
 * input with zod and talk to Supabase Auth. Forms call them via useActionState.
 */

const NOT_CONFIGURED: FormState = {
  status: "error",
  message: "Accounts aren't configured yet. Add your Supabase keys (see SUPABASE_SETUP.md).",
};

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({ email: field(formData, "email"), password: field(formData, "password") });
  if (!parsed.success) return { status: "error", fieldErrors: toFieldErrors(parsed.error) };

  const supabase = await createServerSupabase();
  if (!supabase) return NOT_CONFIGURED;

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // A generic message avoids revealing whether an account exists.
    const message = /confirm/i.test(error.message)
      ? "Please confirm your email address first. Check your inbox for the link."
      : "Incorrect email or password.";
    return { status: "error", message };
  }
  redirect(safeRedirectPath(field(formData, "next"), "/account"));
}

export async function signUpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    displayName: field(formData, "displayName"),
    email: field(formData, "email"),
    password: field(formData, "password"),
    confirmPassword: field(formData, "confirmPassword"),
  });
  if (!parsed.success) return { status: "error", fieldErrors: toFieldErrors(parsed.error) };

  const supabase = await createServerSupabase();
  if (!supabase) return NOT_CONFIGURED;

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${siteConfig.url}/auth/callback?next=/account`,
    },
  });
  if (error) return { status: "error", message: error.message };

  // If email confirmation is turned off in Supabase, the user is signed in immediately.
  if (data.session) redirect("/account");

  return {
    status: "success",
    message: "Check your email: we've sent a link to confirm your account.",
  };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabase();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordResetAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = forgotPasswordSchema.safeParse({ email: field(formData, "email") });
  if (!parsed.success) return { status: "error", fieldErrors: toFieldErrors(parsed.error) };

  const supabase = await createServerSupabase();
  if (!supabase) return NOT_CONFIGURED;

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteConfig.url}/auth/callback?next=/auth/reset-password`,
  });
  if (error && error.status === 429) {
    return { status: "error", message: "Too many requests. Please wait a minute and try again." };
  }
  // Always show the same message so nobody can discover which emails are registered.
  return {
    status: "success",
    message: "If an account exists for that email, you'll receive a reset link shortly.",
  };
}

export async function updatePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetPasswordSchema.safeParse({
    password: field(formData, "password"),
    confirmPassword: field(formData, "confirmPassword"),
  });
  if (!parsed.success) return { status: "error", fieldErrors: toFieldErrors(parsed.error) };

  const supabase = await createServerSupabase();
  if (!supabase) return NOT_CONFIGURED;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Your reset link has expired. Please request a new one." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { status: "error", message: error.message };
  redirect("/account?updated=password");
}
