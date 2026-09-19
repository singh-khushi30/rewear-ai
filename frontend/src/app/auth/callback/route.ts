import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/supabase/env";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));
  const authError = url.searchParams.get("error");

  if (authError || !code) {
    return NextResponse.redirect(
      new URL("/auth/sign-in?reason=confirm-failed", url.origin),
    );
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.redirect(
      new URL("/auth/sign-in?reason=unconfigured", url.origin),
    );
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL("/auth/sign-in?reason=confirm-failed", url.origin),
    );
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
