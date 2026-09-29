import type {
  CandidatePlan,
  NormalizedConstraints,
  PlannerGarment,
} from "../planning/types.js";
import {
  composeValidPlan,
  overCapsuleLimit,
  withDuplicateOutfit,
  withUnknownGarment,
} from "./compose.js";
import type { DeterministicKind } from "./schema.js";

export function scriptedCandidates(
  kind: DeterministicKind,
  wardrobe: PlannerGarment[],
  constraints: NormalizedConstraints,
): CandidatePlan[] {
  const valid = composeValidPlan(wardrobe, constraints);

  switch (kind) {
    case "valid-first-pass":
      return [valid];
    case "invalid-then-valid":
      return [withDuplicateOutfit(valid), valid];
    case "valid-after-two-repairs":
      return [withUnknownGarment(valid), withDuplicateOutfit(valid), valid];
    case "grounded-unsatisfiable":
      if (constraints.mode === "capsule" && constraints.maxPieces !== null) {
        return [overCapsuleLimit(wardrobe, constraints)];
      }

      if ((constraints.outfitCount ?? 1) > 1) {
        return [withDuplicateOutfit(valid)];
      }

      return [withDuplicateOutfit(valid)];
    case "hallucinated-first-pass":
      return [withUnknownGarment(valid), valid];
  }
}
