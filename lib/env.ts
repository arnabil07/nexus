/**
 * Reads environment configuration in one place.
 * Only NEXT_PUBLIC_* values are available in browser code.
 */

export function getSupabaseConfig(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

/** True when Supabase URL and public key are both set. */
export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

/** True when content should be read from Supabase tables instead of /data files. */
export function shouldUseDatabaseContent(): boolean {
  return process.env.NEXUS_CONTENT_SOURCE === "supabase" && isSupabaseConfigured();
}

export function feedsDisabled(): boolean {
  return process.env.NEXUS_DISABLE_FEEDS === "true";
}
