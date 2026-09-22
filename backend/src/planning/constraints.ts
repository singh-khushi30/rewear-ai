import type { PlanningRequestInput } from "./schemas.js";
import type {
  NormalizedConstraints,
  PlannerGarment,
} from "./types.js";

function uniqueIds(ids: string[] | undefined) {
  return [...new Set(ids ?? [])];
}

function wardrobeIdSet(wardrobe: PlannerGarment[]) {
  return new Set(wardrobe.map((garment) => garment.id));
}

export function explicitConstraintFields(request: PlanningRequestInput) {
  return {
    ...(request.mode ? { mode: request.mode } : {}),
    ...(request.outfitCount !== undefined
      ? { outfitCount: request.outfitCount }
      : {}),
    ...(request.maxPieces !== undefined ? { maxPieces: request.maxPieces } : {}),
    ...(request.occasions ? { occasions: request.occasions } : {}),
    ...(request.climate ? { climate: request.climate } : {}),
    ...(request.formality ? { formality: request.formality } : {}),
    ...(request.stylePreference
      ? { stylePreference: request.stylePreference }
      : {}),
    ...(request.requiredGarmentIds
      ? { requiredGarmentIds: request.requiredGarmentIds }
      : {}),
    ...(request.excludedGarmentIds
      ? { excludedGarmentIds: request.excludedGarmentIds }
      : {}),
    ...(request.avoidRepeatOutfits !== undefined
      ? { avoidRepeatOutfits: request.avoidRepeatOutfits }
      : {}),
  };
}

export function mergeConstraints(
  extracted: NormalizedConstraints,
  request: PlanningRequestInput,
  wardrobe: PlannerGarment[],
): NormalizedConstraints {
  const knownIds = wardrobeIdSet(wardrobe);
  const keepKnown = (ids: string[]) => ids.filter((id) => knownIds.has(id));

  const requiredFromRequest = uniqueIds(request.requiredGarmentIds);
  const excludedFromRequest = uniqueIds(request.excludedGarmentIds);

  return {
    mode: request.mode ?? extracted.mode,
    outfitCount: request.outfitCount ?? extracted.outfitCount,
    maxPieces: request.maxPieces ?? extracted.maxPieces,
    occasions: request.occasions ?? extracted.occasions,
    climate: request.climate ?? extracted.climate,
    formality: request.formality ?? extracted.formality,
    stylePreference: request.stylePreference ?? extracted.stylePreference,
    requiredGarmentIds: keepKnown(
      requiredFromRequest.length > 0
        ? requiredFromRequest
        : uniqueIds(extracted.requiredGarmentIds),
    ),
    excludedGarmentIds: keepKnown(
      excludedFromRequest.length > 0
        ? excludedFromRequest
        : uniqueIds(extracted.excludedGarmentIds),
    ),
    avoidRepeatOutfits:
      request.avoidRepeatOutfits ?? extracted.avoidRepeatOutfits,
    hardConstraints: extracted.hardConstraints,
    softPreferences: extracted.softPreferences,
  };
}

export function missingRequiredFromRequest(
  request: PlanningRequestInput,
  wardrobe: PlannerGarment[],
) {
  const knownIds = wardrobeIdSet(wardrobe);
  return uniqueIds(request.requiredGarmentIds).filter((id) => !knownIds.has(id));
}
