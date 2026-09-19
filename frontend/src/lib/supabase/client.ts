import { createBrowserClient } from "@supabase/ssr";
import { getFrontendSupabaseEnv } from "@/lib/supabase/env";

export function createBrowserSupabaseClient() {
  const env = getFrontendSupabaseEnv();
  if (!env) {
    return null;
  }

  return createBrowserClient(env.url, env.anonKey);
}
