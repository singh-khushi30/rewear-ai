import type {
  NormalizedConstraints,
  PlannerGarment,
  ValidationResult,
  ViolationCode,
} from "./types.js";

export function unsatisfiedMessage(
  constraints: NormalizedConstraints | null,
  wardrobe: PlannerGarment[],
  validation: ValidationResult | null,
) {
  const codes = new Set(validation?.violations.map((item) => item.code) ?? []);
  const pieceCount = wardrobe.length;
  const outfitCount = constraints?.outfitCount;
  const maxPieces = constraints?.maxPieces;

  if (codes.has("OUTFIT_COUNT_MISMATCH") && outfitCount !== null) {
    if (maxPieces !== null) {
      return `I couldn’t build ${outfitCount} distinct outfits from ${maxPieces} pieces while keeping all of your constraints.`;
    }

    return `I couldn’t build ${outfitCount} distinct outfits from the ${pieceCount} pieces you own while keeping all of your constraints.`;
  }

  if (codes.has("CAPSULE_LIMIT_EXCEEDED") && maxPieces !== null) {
    return `I couldn’t stay within ${maxPieces} pieces while covering what you asked for.`;
  }

  if (codes.has("REQUIRED_GARMENT_MISSING")) {
    return "A required piece isn’t available in this wardrobe, so I couldn’t finish the plan.";
  }

  if (codes.has("UNKNOWN_GARMENT") || codes.has("OUTFIT_OUTSIDE_CAPSULE")) {
    return "I couldn’t keep every look grounded in the pieces you own.";
  }

  return "I couldn’t satisfy every constraint with the pieces you own.";
}

export function emptyWardrobeMessage() {
  return "Add a few pieces to your wardrobe first. REWEAR can only plan with what you already own.";
}

export function userSafeViolationCodes(validation: ValidationResult | null) {
  return [
    ...new Set(validation?.violations.map((item) => item.code) ?? []),
  ] as ViolationCode[];
}
