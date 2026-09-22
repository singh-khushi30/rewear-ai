import { cn } from "@/lib/cn";
import {
  composeOutfitSlots,
  type OutfitSlots,
} from "@/lib/planning/garment-role";
import type { ResolvedLookPiece } from "@/lib/planning/look";

export function OutfitComposition({
  garments,
}: {
  garments: ResolvedLookPiece[];
}) {
  const owned = garments.filter((piece) => piece.owned);
  const slots = composeOutfitSlots(owned);
  const hasBody = Boolean(slots.full || slots.upper || slots.lower);
  const label =
    owned.length > 0
      ? `Assembled look: ${owned.map((piece) => piece.category).join(", ")}`
      : "Assembled look";

  return (
    <section
      aria-label={label}
      className="bg-ivory-warm relative aspect-[3/4] w-full max-w-[20rem] overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgb(23_24_21/0.05)]" />
      <CompositionLayers slots={slots} hasBody={hasBody} />
    </section>
  );
}

function CompositionLayers({
  slots,
  hasBody,
}: {
  slots: OutfitSlots;
  hasBody: boolean;
}) {
  const standalone = slots.standalone;
  const layeredOuter =
    hasBody && slots.outer && slots.outer.id !== standalone?.id
      ? slots.outer
      : null;
  const layeredFootwear =
    slots.footwear && slots.footwear.id !== standalone?.id
      ? slots.footwear
      : null;
  const layeredAccessory =
    slots.accessory && slots.accessory.id !== standalone?.id
      ? slots.accessory
      : null;

  return (
    <div className="absolute inset-0">
      {layeredOuter ? (
        <GarmentPlate
          piece={layeredOuter}
          role="outer"
          className="top-[6%] left-[14%] z-0 h-[36%] w-[72%]"
        />
      ) : null}

      {slots.full ? (
        <GarmentPlate
          piece={slots.full}
          role="full"
          className="top-[12%] left-[21%] z-10 h-[66%] w-[58%]"
        />
      ) : null}

      {!slots.full && slots.upper ? (
        <GarmentPlate
          piece={slots.upper}
          role="upper"
          className="top-[8%] left-[22%] z-10 h-[40%] w-[56%]"
        />
      ) : null}

      {!slots.full && slots.lower ? (
        <GarmentPlate
          piece={slots.lower}
          role="lower"
          className="top-[41%] left-[22%] z-20 h-[40%] w-[56%]"
        />
      ) : null}

      {standalone ? (
        <GarmentPlate
          piece={standalone}
          role="standalone"
          className="top-[16%] left-[18%] z-10 h-[68%] w-[64%]"
        />
      ) : null}

      {layeredFootwear ? (
        <GarmentPlate
          piece={layeredFootwear}
          role="footwear"
          className="top-[80%] left-[36%] z-10 h-[16%] w-[28%]"
        />
      ) : null}

      {layeredAccessory ? (
        <GarmentPlate
          piece={layeredAccessory}
          role="accessory"
          className="top-[28%] right-[6%] left-auto z-30 h-[18%] w-[20%]"
        />
      ) : null}

      {slots.extras.map((piece, index) => (
        <GarmentPlate
          key={piece.id}
          piece={piece}
          role="extra"
          className={cn(
            "left-[5%] z-20 h-[16%] w-[16%]",
            index === 0 ? "top-[22%]" : "top-[42%]",
          )}
        />
      ))}
    </div>
  );
}

function GarmentPlate({
  piece,
  role,
  className,
}: {
  piece: ResolvedLookPiece;
  role: string;
  className?: string;
}) {
  const alt = piece.primaryColor
    ? `${piece.primaryColor} ${piece.category}`
    : piece.category;

  return (
    <figure
      data-role={role}
      className={cn(
        "absolute overflow-hidden bg-ivory-warm shadow-[0_8px_20px_rgb(23_24_21/0.06)]",
        className,
      )}
    >
      {piece.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={piece.imageUrl}
          alt={alt}
          className="h-full w-full object-contain object-center"
        />
      ) : (
        <div className="border-stone/70 flex h-full items-end border p-3">
          <figcaption className="label text-olive/65">{piece.category}</figcaption>
        </div>
      )}
    </figure>
  );
}
