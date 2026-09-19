import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthScreen } from "@/components/auth/auth-screen";
import { redirectIfAuthenticated } from "@/lib/auth/require-user";
import { safeNextPath } from "@/lib/supabase/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in — REWEAR",
  description: "Sign in to your REWEAR wardrobe.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reason?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next);

  await redirectIfAuthenticated(nextPath);

  return (
    <main id="main">
      <AuthScreen
        eyebrow="Account"
        title="Welcome back."
        description="Sign in to open the pieces REWEAR can plan with."
      >
        <AuthForm mode="sign-in" nextPath={nextPath} reason={params.reason} />
      </AuthScreen>
    </main>
  );
}
