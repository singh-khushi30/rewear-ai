import { createClient } from "@supabase/supabase-js";

/**
 * Privileged server client for future Express/Gemini work.
 * Never import this into the frontend. Wardrobe CRUD uses the
 * authenticated user client + RLS instead.
 */
export function createSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
