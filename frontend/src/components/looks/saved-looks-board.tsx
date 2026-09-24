import Link from "next/link";
import { OutfitComposition } from "@/components/plan/outfit-composition";
import { ButtonLink } from "@/components/button-link";
import { formatSavedDate, pieceCountLabel } from "@/lib/looks/format";
import { savedLookToPieces } from "@/lib/looks/pieces";
import type { SavedLook } from "@/lib/looks/types";

export function SavedLooksBoard({
  looks,
  error,
}: {
  looks: SavedLook[];
  error: string | null;
}) {
  if (error) {
    return (
      <div className="mt-16 max-w-xl">
        <p className="label text-olive mb-4">Note</p>
        <p role="alert" className="text-ink text-[1.05rem] leading-relaxed">
          {error}
        </p>
      </div>
    );
  }

  if (looks.length === 0) {
    return (
      <div className="mt-16 max-w-xl">
        <p className="label text-olive mb-4">No saved looks yet</p>
        <p className="text-ink text-[1.05rem] leading-relaxed">
          Plan a look you love and save it here for later.
        </p>
        <div className="mt-10">
          <ButtonLink href="/plan">Plan a look</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <ol className="mt-16 grid gap-14 sm:grid-cols-2 lg:grid-cols-3">
      {looks.map((look) => (
        <li key={look.id}>
          <Link href={`/looks/${look.id}`} className="block">
            <OutfitComposition garments={savedLookToPieces(look)} />
            <p className="label text-olive mt-5">
              {look.title || look.occasion || "Saved look"}
            </p>
            <p className="text-olive/65 mt-2 text-sm">
              {pieceCountLabel(look.pieces.length)}
              <span aria-hidden="true"> · </span>
              {formatSavedDate(look.createdAt)}
            </p>
          </Link>
        </li>
      ))}
    </ol>
  );
}
