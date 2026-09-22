export type WardrobeLookItem = {
  id: string;
  category: string;
  primary_color: string;
  imageUrl: string | null;
};

export type ResolvedLookPiece = {
  id: string;
  category: string;
  primaryColor: string;
  imageUrl: string | null;
  owned: boolean;
};

export function lookLabel(index: number) {
  return `Look ${String(index + 1).padStart(2, "0")}`;
}

export function resolveLookPieces(
  garmentIds: string[],
  garments: Map<string, WardrobeLookItem>,
): ResolvedLookPiece[] {
  return garmentIds.map((id) => {
    const item = garments.get(id);
    if (!item) {
      return {
        id,
        category: "Unavailable",
        primaryColor: "",
        imageUrl: null,
        owned: false,
      };
    }

    return {
      id: item.id,
      category: item.category,
      primaryColor: item.primary_color,
      imageUrl: item.imageUrl,
      owned: true,
    };
  });
}

export function canonicalOwnedIds(pieces: ResolvedLookPiece[]) {
  return pieces.filter((piece) => piece.owned).map((piece) => piece.id);
}
