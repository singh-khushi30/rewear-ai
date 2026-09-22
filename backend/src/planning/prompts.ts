import type {
  CandidatePlan,
  NormalizedConstraints,
  PlannerGarment,
  ValidationResult,
} from "./types.js";

export const constraintExtractionSystemPrompt = `You convert a wardrobe planning request into structured constraints.

Hard constraints are limits the user stated explicitly: piece counts, outfit counts, required or excluded garments, carry-on-only piece limits, named occasions they said they must dress for.

Soft preferences are taste: polished, relaxed, smart casual, cool and rainy if they only described weather, style direction.

Rules:
- Never invent a hard constraint the user did not state.
- Never turn a preference into an absolute restriction.
- If the user did not specify a number, leave outfitCount or maxPieces null.
- Use mode "capsule" only when they ask for a limited capsule, a trip with a piece cap, or a small set of pieces that must cover multiple looks.
- Otherwise use mode "outfit".
- requiredGarmentIds and excludedGarmentIds may only contain IDs that appear in the provided request fields. Do not invent garment IDs.
- avoidRepeatOutfits is true unless the user explicitly allows repeating a full outfit.
- climate may be filled only if the user stated weather or climate themselves.
- hardConstraints and softPreferences are short labels, not sentences.`;

export const plannerSystemPrompt = `You are REWEAR's wardrobe planner. You compose outfits or a small capsule from garments the user already owns.

Rules:
- Use only garment IDs from the provided wardrobe inventory.
- Never invent a garment, ID, color, or category.
- Reference garments only by their real IDs.
- Each outfit must contain distinct garment IDs.
- Do not repeat the same full garment combination as two outfits.
- Honor every hard constraint exactly.
- Treat soft preferences as guidance, not vetoes.
- For outfit mode, leave capsuleGarmentIds empty.
- For capsule mode, list the unique selected IDs in capsuleGarmentIds, and build every outfit only from that set.
- Keep each rationale to one short sentence about why the combination works.`;

export const repairSystemPrompt = `You repair a wardrobe plan so it satisfies a deterministic validator.

You receive the original constraints, the wardrobe inventory, the previous candidate plan, and exact structured violations.

Rules:
- Revise only what is necessary to clear the listed violations.
- Use only garment IDs from the wardrobe inventory.
- Never invent a garment or ID.
- Do not drop hard constraints to make the plan easier.
- Keep valid outfits when they do not cause a violation.
- Return a complete revised plan in the same schema.`;

export function constraintExtractionUserPrompt(input: {
  request: string;
  explicit: Record<string, unknown>;
}) {
  return [
    "Convert this request into normalized planning constraints.",
    "",
    `User request: ${input.request}`,
    "",
    `Explicit fields already provided by the client (override the text when present): ${JSON.stringify(input.explicit)}`,
    "",
    "Return JSON only.",
  ].join("\n");
}

export function plannerUserPrompt(input: {
  request: string;
  constraints: NormalizedConstraints;
  wardrobe: PlannerGarment[];
}) {
  return [
    "Build a candidate plan from this wardrobe.",
    "",
    `Original request: ${input.request}`,
    "",
    `Normalized constraints: ${JSON.stringify(input.constraints)}`,
    "",
    `Wardrobe inventory: ${JSON.stringify(input.wardrobe)}`,
    "",
    "Return JSON only. garmentIds must be real inventory IDs.",
  ].join("\n");
}

export function repairUserPrompt(input: {
  request: string;
  constraints: NormalizedConstraints;
  wardrobe: PlannerGarment[];
  previousPlan: CandidatePlan;
  validation: ValidationResult;
}) {
  return [
    "Repair this plan so it passes the validator.",
    "",
    `Original request: ${input.request}`,
    "",
    `Normalized constraints: ${JSON.stringify(input.constraints)}`,
    "",
    `Wardrobe inventory: ${JSON.stringify(input.wardrobe)}`,
    "",
    `Previous candidate plan: ${JSON.stringify(input.previousPlan)}`,
    "",
    `Validator violations: ${JSON.stringify(input.validation.violations)}`,
    "",
    "Return a complete revised plan as JSON.",
  ].join("\n");
}
