import { z } from "zod";

/**
 * Validation rules for auth and profile forms. The same schemas run on the
 * server (in server actions), so invalid data is rejected even if someone
 * bypasses the browser.
 */

const email = z.string().trim().min(1, "Enter your email address.").email("Enter a valid email address.");

const password = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password must be 72 characters or fewer.")
  .regex(/[A-Za-z]/, "Password must include a letter.")
  .regex(/[0-9]/, "Password must include a number.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});

export const registerSchema = z
  .object({
    displayName: z.string().trim().min(2, "Name must be at least 2 characters.").max(60, "Name is too long."),
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({ password, confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  displayName: z.string().trim().min(2, "Name must be at least 2 characters.").max(60, "Name is too long."),
});

/** Shape returned by every form action. */
export interface FormState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
}

export const initialFormState: FormState = { status: "idle" };

/** Turns zod issues into { field: "first error message" }. */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    result[key] ??= issue.message;
  }
  return result;
}
