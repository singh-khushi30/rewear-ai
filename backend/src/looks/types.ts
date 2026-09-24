export type SavedLookPiece = {
  id: string;
  category: string;
  primaryColor: string;
  imageUrl: string | null;
};

export type SavedLookRecord = {
  id: string;
  title: string;
  occasion: string;
  rationale: string;
  createdAt: string;
  pieces: SavedLookPiece[];
};

export type OwnedGarment = {
  id: string;
  category: string;
  primaryColor: string;
  imagePath: string;
};

export type SaveLookInput = {
  accessToken: string;
  userId: string;
  title: string;
  occasion: string;
  rationale: string;
  garmentIds: string[];
};

export type LoadOwnedGarments = (
  accessToken: string,
  garmentIds: string[],
) => Promise<OwnedGarment[]>;

export type SaveLook = (input: SaveLookInput) => Promise<SavedLookRecord>;

export type ListLooks = (accessToken: string) => Promise<SavedLookRecord[]>;

export type GetLook = (
  accessToken: string,
  lookId: string,
) => Promise<SavedLookRecord | null>;

export type DeleteLook = (
  accessToken: string,
  lookId: string,
) => Promise<boolean>;
