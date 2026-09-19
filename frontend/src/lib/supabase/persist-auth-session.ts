"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function persistAuthSession() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return;
  }

  await supabase.auth.getUser();
}
