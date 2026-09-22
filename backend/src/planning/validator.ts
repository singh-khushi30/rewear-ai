import type {
  CandidatePlan,
  NormalizedConstraints,
  PlannerGarment,
  PlanViolation,
  ValidationResult,
} from "./types.js";

function uniqueSorted(ids: string[]) {
  return [...new Set(ids)].sort();
}

function outfitSignature(garmentIds: string[]) {
  return uniqueSorted(garmentIds).join("|");
}

function addViolation(
  violations: PlanViolation[],
  violation: PlanViolation,
) {
  const exists = violations.some(
    (current) =>
      current.code === violation.code &&
      JSON.stringify(current.details ?? {}) ===
        JSON.stringify(violation.details ?? {}),
  );

  if (!exists) {
    violations.push(violation);
  }
}

export function validatePlan(
  constraints: NormalizedConstraints,
  wardrobe: PlannerGarment[],
  plan: CandidatePlan,
): ValidationResult {
  const wardrobeIds = new Set(wardrobe.map((garment) => garment.id));
  const excluded = new Set(constraints.excludedGarmentIds);
  const required = new Set(constraints.requiredGarmentIds);
  const capsuleIds = uniqueSorted(plan.capsuleGarmentIds);
  const capsuleSet = new Set(capsuleIds);
  const outfitGarmentIds = plan.outfits.flatMap((outfit) => outfit.garmentIds);
  const selectedIds = uniqueSorted([...capsuleIds, ...outfitGarmentIds]);
  const usedIds = uniqueSorted(outfitGarmentIds);
  const violations: PlanViolation[] = [];

  for (const garmentId of selectedIds) {
    if (!wardrobeIds.has(garmentId)) {
      addViolation(violations, {
        code: "UNKNOWN_GARMENT",
        message: "A planned garment is not in this wardrobe.",
        details: { garmentId },
      });
    }
  }

  for (const garmentId of selectedIds) {
    if (excluded.has(garmentId)) {
      addViolation(violations, {
        code: "EXCLUDED_GARMENT_USED",
        message: "An excluded garment appears in the plan.",
        details: { garmentId },
      });
    }
  }

  const presentIds = new Set(usedIds);
  if (constraints.mode === "capsule") {
    for (const garmentId of capsuleIds) {
      presentIds.add(garmentId);
    }
  }

  for (const garmentId of required) {
    if (!presentIds.has(garmentId)) {
      addViolation(violations, {
        code: "REQUIRED_GARMENT_MISSING",
        message: "A required garment is missing from the plan.",
        details: { garmentId },
      });
    }
  }

  if (constraints.mode === "capsule" && constraints.maxPieces !== null) {
    const actual = selectedIds.length;
    if (actual > constraints.maxPieces) {
      addViolation(violations, {
        code: "CAPSULE_LIMIT_EXCEEDED",
        message: `Plan uses ${actual} unique pieces but the maximum is ${constraints.maxPieces}.`,
        details: {
          actual,
          allowed: constraints.maxPieces,
        },
      });
    }
  }

  if (
    constraints.outfitCount !== null &&
    plan.outfits.length !== constraints.outfitCount
  ) {
    addViolation(violations, {
      code: "OUTFIT_COUNT_MISMATCH",
      message: `Plan has ${plan.outfits.length} outfits but ${constraints.outfitCount} were requested.`,
      details: {
        actual: plan.outfits.length,
        expected: constraints.outfitCount,
      },
    });
  }

  for (const [index, outfit] of plan.outfits.entries()) {
    if (outfit.garmentIds.length === 0) {
      addViolation(violations, {
        code: "EMPTY_OUTFIT",
        message: "An outfit contains no garments.",
        details: { outfitId: outfit.id, index },
      });
    }

    const seen = new Set<string>();
    for (const garmentId of outfit.garmentIds) {
      if (seen.has(garmentId)) {
        addViolation(violations, {
          code: "DUPLICATE_GARMENT_IN_OUTFIT",
          message: "The same garment appears more than once in an outfit.",
          details: { outfitId: outfit.id, garmentId, index },
        });
        break;
      }
      seen.add(garmentId);
    }
  }

  const signatures = new Map<string, string>();
  for (const [index, outfit] of plan.outfits.entries()) {
    if (outfit.garmentIds.length === 0) {
      continue;
    }

    const signature = outfitSignature(outfit.garmentIds);
    const previous = signatures.get(signature);
    if (previous) {
      addViolation(violations, {
        code: "DUPLICATE_OUTFIT",
        message: "Two outfits use the same garment combination.",
        details: {
          outfitId: outfit.id,
          duplicateOf: previous,
          index,
        },
      });
      continue;
    }

    signatures.set(signature, outfit.id);
  }

  if (constraints.mode === "capsule" || plan.mode === "capsule") {
    for (const [index, outfit] of plan.outfits.entries()) {
      const outside = uniqueSorted(
        outfit.garmentIds.filter((garmentId) => !capsuleSet.has(garmentId)),
      );

      if (outside.length > 0) {
        addViolation(violations, {
          code: "OUTFIT_OUTSIDE_CAPSULE",
          message: "An outfit uses a piece that is not in the selected capsule.",
          details: {
            outfitId: outfit.id,
            garmentIds: outside,
            index,
          },
        });
      }
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}
