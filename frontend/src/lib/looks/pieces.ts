import type { ResolvedLookPiece } from "@/lib/planning/look";
import type { SavedLook } from "./types";

export function savedLookToPieces(look: SavedLook): ResolvedLookPiece[] {
  return look.pieces.map((piece) => ({
    id: piece.id,
    category: piece.category,
    primaryColor: piece.primaryColor,
    imageUrl: piece.imageUrl,
    owned: true,
  }));
}
