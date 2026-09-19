import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getFrontendSupabaseEnv } from "@/lib/supabase/env";

export async function createServerSupabaseClient() {
  const env = getFrontendSupabaseEnv();
  if (!env) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot persist refreshed cookies. The browser
          // client plus the Node auth callback/session action handle writes.
        }
      },
    },
  });
}
