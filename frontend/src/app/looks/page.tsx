import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { SavedLooksBoard } from "@/components/looks/saved-looks-board";
import { SiteHeader } from "@/components/site-header";
import { requireUser } from "@/lib/auth/require-user";
import { SavedLookError } from "@/lib/looks/errors";
import { requestSavedLooks } from "@/lib/looks/request";
import type { SavedLook } from "@/lib/looks/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Saved Looks — REWEAR",
  description: "Looks worth wearing again.",
};

export default async function SavedLooksPage() {
  const { supabase } = await requireUser("/looks");
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let looks: SavedLook[] = [];
  let error: string | null = null;

  if (!session?.access_token) {
    error = "Sign in to see looks you have saved.";
  } else {
    try {
      looks = await requestSavedLooks(session.access_token);
    } catch (caught) {
      error =
        caught instanceof SavedLookError
          ? caught.message
          : "We couldn’t open your saved looks. Try again shortly.";
    }
  }

  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-28 pb-24 lg:pt-32">
        <Container>
          <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-2">
            <p className="label text-olive">Saved looks</p>
            <Link
              href="/plan"
              className="label text-olive/55 hover:text-olive transition-colors duration-500"
            >
              Plan Looks
            </Link>
          </div>
          <div className="max-w-2xl">
            <h1 className="font-serif text-headline text-olive text-balance">
              Saved Looks
            </h1>
            <p className="text-ink mt-5 max-w-md text-[1.05rem] leading-relaxed">
              Looks worth wearing again.
            </p>
          </div>
          <SavedLooksBoard looks={looks} error={error} />
        </Container>
      </main>
    </>
  );
}
