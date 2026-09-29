import { mergeConstraints } from "../planning/constraints.js";
import type { PlanningRequestInput } from "../planning/schemas.js";
import type {
  NormalizedConstraints,
  PlannerGarment,
} from "../planning/types.js";
import type { ExpectedConstraints } from "./schema.js";

export function constraintsFromScenario(
  request: PlanningRequestInput,
  expected: ExpectedConstraints,
  wardrobe: PlannerGarment[],
): NormalizedConstraints {
  const extracted: NormalizedConstraints = {
    mode: expected.mode ?? request.mode ?? "outfit",
    outfitCount: expected.outfitCount ?? request.outfitCount ?? null,
    maxPieces: expected.maxPieces ?? request.maxPieces ?? null,
    occasions: request.occasions ?? [],
    climate: request.climate ?? null,
    formality: request.formality ?? null,
    stylePreference: request.stylePreference ?? null,
    requiredGarmentIds: expected.requiredGarmentIds ?? request.requiredGarmentIds ?? [],
    excludedGarmentIds: expected.excludedGarmentIds ?? request.excludedGarmentIds ?? [],
    avoidRepeatOutfits: request.avoidRepeatOutfits ?? true,
    hardConstraints: [],
    softPreferences: [],
  };

  return mergeConstraints(extracted, request, wardrobe);
}
