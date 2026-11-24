import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/env";

/**
 * A cookie-free Supabase client for reading PUBLIC content (topics, resources…).
 * Because it does not read cookies, pages that use it can still be statically
 * generated and cached. Row Level Security only allows reading published rows.
 */
export function createPublicClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config) return null;
  return createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
