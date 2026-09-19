import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function requireUser(nextPath: string) {
  const supabase = await createServerSupabaseClient();
  const next = encodeURIComponent(nextPath);

  if (!supabase) {
    redirect(`/auth/sign-in?next=${next}&reason=unconfigured`);
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(`/auth/sign-in?next=${next}`);
  }

  return { supabase, user };
}

export async function redirectIfAuthenticated(nextPath: string) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(nextPath);
  }
}
