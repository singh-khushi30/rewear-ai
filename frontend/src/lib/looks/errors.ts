export type SavedLookErrorCode =
  | "UNAUTHENTICATED"
  | "INVALID_REQUEST"
  | "FOREIGN_GARMENT"
  | "LOOK_NOT_FOUND"
  | "LOOKS_UNAVAILABLE"
  | "NETWORK";

export class SavedLookError extends Error {
  constructor(
    message: string,
    readonly code: SavedLookErrorCode,
  ) {
    super(message);
    this.name = "SavedLookError";
  }
}

export function savedLookErrorMessage(code: SavedLookErrorCode) {
  switch (code) {
    case "UNAUTHENTICATED":
      return "Sign in to save looks from your wardrobe.";
    case "FOREIGN_GARMENT":
      return "A look can only be saved from garments you own.";
    case "LOOK_NOT_FOUND":
      return "That saved look is no longer available.";
    case "LOOKS_UNAVAILABLE":
    case "NETWORK":
      return "Saved looks are temporarily unavailable. Try again shortly.";
    default:
      return "We couldn’t save that look. Try again.";
  }
}
