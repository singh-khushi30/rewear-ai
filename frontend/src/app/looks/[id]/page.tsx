import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/container";
import { RemoveSavedLook } from "@/components/looks/remove-saved-look";
import { OutfitComposition } from "@/components/plan/outfit-composition";
import { PieceThumbnails } from "@/components/plan/piece-thumbnails";
import { SiteHeader } from "@/components/site-header";
import { requireUser } from "@/lib/auth/require-user";
import { SavedLookError } from "@/lib/looks/errors";
import { formatSavedDate, pieceCountLabel } from "@/lib/looks/format";
import { savedLookToPieces } from "@/lib/looks/pieces";
import { requestSavedLook } from "@/lib/looks/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Saved Look — REWEAR",
  description: "A look saved from your wardrobe.",
};

export default async function SavedLookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    notFound();
  }

  const { supabase } = await requireUser(`/looks/${id}`);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    redirect(`/auth/sign-in?next=${encodeURIComponent(`/looks/${id}`)}`);
  }

  let look;
  try {
    look = await requestSavedLook(session.access_token, id);
  } catch (caught) {
    if (caught instanceof SavedLookError && caught.code === "LOOK_NOT_FOUND") {
      notFound();
    }

    look = null;
  }

  if (!look) {
    return (
      <>
        <SiteHeader />
        <main id="main" className="pt-28 pb-24 lg:pt-32">
          <Container>
            <p className="label text-olive mb-4">Note</p>
            <p className="text-ink max-w-md text-[1.05rem] leading-relaxed">
              We couldn’t open that saved look. Try again shortly.
            </p>
            <Link
              href="/looks"
              className="label text-olive mt-10 inline-flex transition-colors duration-500"
            >
              Back to saved looks
            </Link>
          </Container>
        </main>
      </>
    );
  }

  const pieces = savedLookToPieces(look);

  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-28 pb-24 lg:pt-32">
        <Container>
          <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link
              href="/looks"
              className="label text-olive/55 hover:text-olive transition-colors duration-500"
            >
              Saved Looks
            </Link>
          </div>
          <div className="mb-10 flex max-w-3xl flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="label text-olive mb-4">
                {look.occasion || "Saved look"}
              </p>
              <h1 className="font-serif text-headline text-olive text-balance">
                {look.title || look.occasion || "Saved look"}
              </h1>
              <p className="text-olive/65 mt-4 text-sm">
                {pieceCountLabel(look.pieces.length)}
                <span aria-hidden="true"> · </span>
                {formatSavedDate(look.createdAt)}
              </p>
            </div>
            <RemoveSavedLook lookId={look.id} />
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-12">
            <OutfitComposition garments={pieces} />
            <div className="min-w-0">
              <p className="label text-olive mb-4">Your pieces</p>
              <PieceThumbnails pieces={pieces} />
              <p className="label text-olive mt-8 mb-3">Why it works</p>
              <p className="text-ink max-w-md text-[1.05rem] leading-relaxed">
                {look.rationale}
              </p>
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}
