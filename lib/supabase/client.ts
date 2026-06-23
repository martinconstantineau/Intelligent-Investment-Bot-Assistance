import { createBrowserClient } from "@supabase/ssr";

const missingSupabaseConfigurationMessage =
  "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.";

function readSupabaseBrowserEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  // Accept both the Supabase UI "publishable key" name and the conventional "anon key" name
  const publishableKey = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )?.trim();

  if (!url || !publishableKey) {
    return null;
  }

  return { url, publishableKey };
}

export function isSupabaseConfigured() {
  return readSupabaseBrowserEnv() !== null;
}

export function getSupabaseConfigurationErrorMessage() {
  return missingSupabaseConfigurationMessage;
}

export function createClient() {
  const env = readSupabaseBrowserEnv();

  if (!env) {
    throw new Error(missingSupabaseConfigurationMessage);
  }

  return createBrowserClient(env.url, env.publishableKey);
}
