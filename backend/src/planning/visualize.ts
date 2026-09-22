export class VisualizationUnavailableError extends Error {
  constructor() {
    super("Outfit visualization is unavailable.");
    this.name = "VisualizationUnavailableError";
  }
}

export type OutfitPreview = {
  mimeType: string;
  data: string;
};

export type VisualizeOutfit = () => Promise<OutfitPreview | null>;

/** Kept as a no-op so this module cannot call a paid image model. */
export function createVisualizeOutfit(): VisualizeOutfit {
  return async () => null;
}
