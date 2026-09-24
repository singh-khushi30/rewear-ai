export type SavedLookPiece = {
  id: string;
  category: string;
  primaryColor: string;
  imageUrl: string | null;
};

export type SavedLook = {
  id: string;
  title: string;
  occasion: string;
  rationale: string;
  createdAt: string;
  pieces: SavedLookPiece[];
};

export type SaveLookStatus = "idle" | "saving" | "saved" | "error";
