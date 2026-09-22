import { OutfitComposition } from "@/components/plan/outfit-composition";
import {
  lookLabel,
  resolveLookPieces,
  type ResolvedLookPiece,
} from "@/lib/planning/look";
import type { PlanningOutfit, PlanningSuccess } from "@/lib/planning/types";
import type { WardrobeItem } from "@/lib/wardrobe/garments";

export function PlanResults({
  result,
  garments,
}: {
  result: PlanningSuccess;
  garments: Map<string, WardrobeItem>;
}) {
  const capsuleIds =
    result.plan.mode === "capsule" ? result.plan.capsuleGarmentIds : [];
  const capsulePieces = resolveLookPieces(capsuleIds, garments);
  const heading =
    result.plan.mode === "capsule"
      ? `Your ${result.meta.piecesUsed}-piece capsule`
      : `${result.meta.lookCount} looks from your wardrobe`;

  return (
    <section className="mt-20 max-w-5xl">
      <div className="border-t border-stone pt-10">
        <p className="label text-olive">{heading}</p>
        <p className="text-olive/65 mt-3 text-sm">
          {result.meta.piecesUsed} pieces · {result.meta.lookCount} looks
        </p>
      </div>

      {capsulePieces.length > 0 ? (
        <div className="mt-12">
          <p className="label text-olive mb-4">Selected pieces</p>
          <PieceThumbnails pieces={capsulePieces} />
        </div>
      ) : null}

      <ol className="mt-14 space-y-14">
        {result.plan.outfits.map((outfit, index) => (
          <li key={outfit.id}>
            <LookCard outfit={outfit} index={index} garments={garments} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function LookCard({
  outfit,
  index,
  garments,
}: {
  outfit: PlanningOutfit;
  index: number;
  garments: Map<string, WardrobeItem>;
}) {
  const pieces = resolveLookPieces(outfit.garmentIds, garments);

  return (
    <article>
      <p className="label text-olive mb-6">
        {lookLabel(index)}
        {outfit.occasion ? ` · ${outfit.occasion}` : ""}
      </p>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-12">
        <OutfitComposition garments={pieces} />

        <div className="min-w-0">
          <p className="label text-olive mb-4">Your pieces</p>
          <PieceThumbnails pieces={pieces} />

          <p className="label text-olive mt-8 mb-3">Why it works</p>
          <p className="text-ink max-w-md text-[1.05rem] leading-relaxed">
            {outfit.rationale}
          </p>
        </div>
      </div>
    </article>
  );
}

function PieceThumbnails({ pieces }: { pieces: ResolvedLookPiece[] }) {
  return (
    <ul className="flex flex-wrap gap-3">
      {pieces.map((piece) => (
        <li key={piece.id} className="w-[4.75rem] min-w-0 sm:w-[5.25rem]">
          <div className="bg-olive relative aspect-[3/4] overflow-hidden">
            {piece.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={piece.imageUrl}
                alt={`${piece.primaryColor} ${piece.category}`.trim()}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-end p-2">
                <p className="label text-ivory/70">
                  {piece.owned ? piece.category : "Unavailable"}
                </p>
              </div>
            )}
          </div>
          <p className="text-olive mt-2 font-serif text-sm leading-snug capitalize">
            {piece.category}
          </p>
        </li>
      ))}
    </ul>
  );
}
