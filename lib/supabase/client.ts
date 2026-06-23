import { createBrowserClient } from "@supabase/ssr";

const missingSupabaseConfigurationMessage =
  "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.";

function readSupabaseBrowserEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

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
