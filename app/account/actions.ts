"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { profileSchema, toFieldErrors, type FormState } from "@/lib/validation/auth";

/** Updates the signed-in user's display name in the `profiles` table. */
export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = formData.get("displayName");
  const parsed = profileSchema.safeParse({ displayName: typeof raw === "string" ? raw : "" });
  if (!parsed.success) return { status: "error", fieldErrors: toFieldErrors(parsed.error) };

  const supabase = await createServerSupabase();
  if (!supabase) return { status: "error", message: "Accounts aren't configured yet." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Your session has expired. Please sign in again." };

  // RLS ensures a user can only update their own row.
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: parsed.data.displayName, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) return { status: "error", message: "Couldn't save your profile. Please try again." };

  revalidatePath("/account");
  return { status: "success", message: "Profile saved." };
}
