import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthScreen } from "@/components/auth/auth-screen";
import { redirectIfAuthenticated } from "@/lib/auth/require-user";
import { safeNextPath } from "@/lib/supabase/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create an account — REWEAR",
  description: "Create a REWEAR account to save your wardrobe.",
};

export default async function SignUpPage({
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
        title="Begin with one piece."
        description="Create an account so the garments you confirm stay with you."
      >
        <AuthForm mode="sign-up" nextPath={nextPath} reason={params.reason} />
      </AuthScreen>
    </main>
  );
}
