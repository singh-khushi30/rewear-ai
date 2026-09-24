import type { ResolvedLookPiece } from "@/lib/planning/look";

export function PieceThumbnails({ pieces }: { pieces: ResolvedLookPiece[] }) {
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
