"use client";

import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { useActionState, type ReactNode } from "react";
import {
  requestPasswordResetAction,
  signInAction,
  signUpAction,
  updatePasswordAction,
} from "@/app/auth/actions";
import { updateProfileAction } from "@/app/account/actions";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { initialFormState, type FormState } from "@/lib/validation/auth";
import { cn } from "@/lib/utils";

/**
 * Auth forms. Each one calls a server action via React's useActionState,
 * which gives us the returned state (errors / success) and a pending flag.
 * The browser checks basic rules (required, type="email") and the server
 * validates everything again with zod.
 */

function Field({
  name,
  label,
  type = "text",
  autoComplete,
  state,
  defaultValue,
  hint,
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  state: FormState;
  defaultValue?: string;
  hint?: string;
}) {
  const error = state.fieldErrors?.[name];
  const errorId = `${name}-error`;
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(error && "border-accent")}
      />
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      <FieldError id={errorId} message={error} />
    </div>
  );
}

function FormMessage({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={cn(
        "rounded-md border px-3 py-2.5 text-sm",
        state.status === "error" ? "border-accent/40 bg-accent/10 text-foreground" : "border-border bg-surface text-foreground",
      )}
    >
      {state.message}
    </p>
  );
}

function SubmitButton({ pending, children }: { pending: boolean; children: ReactNode }) {
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
      {children}
    </Button>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signInAction, initialFormState);
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <input type="hidden" name="next" value={next ?? "/account"} />
      <Field name="email" label="Email" type="email" autoComplete="email" state={state} />
      <Field name="password" label="Password" type="password" autoComplete="current-password" state={state} />
      <div className="flex justify-end">
        <Link href="/auth/forgot-password" className="text-sm text-accent hover:text-accent-hover">
          Forgot password?
        </Link>
      </div>
      <SubmitButton pending={pending}>Sign in</SubmitButton>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(signUpAction, initialFormState);
  if (state.status === "success") return <FormMessage state={state} />;
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <Field name="displayName" label="Name" autoComplete="name" state={state} />
      <Field name="email" label="Email" type="email" autoComplete="email" state={state} />
      <Field
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        state={state}
        hint="At least 8 characters, including a letter and a number."
      />
      <Field name="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" state={state} />
      <SubmitButton pending={pending}>Create account</SubmitButton>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, initialFormState);
  if (state.status === "success") return <FormMessage state={state} />;
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <Field name="email" label="Email" type="email" autoComplete="email" state={state} />
      <SubmitButton pending={pending}>Send reset link</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePasswordAction, initialFormState);
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <Field
        name="password"
        label="New password"
        type="password"
        autoComplete="new-password"
        state={state}
        hint="At least 8 characters, including a letter and a number."
      />
      <Field name="confirmPassword" label="Confirm new password" type="password" autoComplete="new-password" state={state} />
      <SubmitButton pending={pending}>Update password</SubmitButton>
    </form>
  );
}

export function ProfileForm({ displayName }: { displayName: string }) {
  const [state, action, pending] = useActionState(updateProfileAction, initialFormState);
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <Field name="displayName" label="Display name" autoComplete="name" state={state} defaultValue={displayName} />
      <Button type="submit" disabled={pending}>
        {pending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
        Save profile
      </Button>
    </form>
  );
}
