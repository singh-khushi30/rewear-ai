import type { PlanningRequestInput } from "./schemas.js";
import { generateNormalizedConstraints } from "./llm.js";
import {
  constraintExtractionSystemPrompt,
  constraintExtractionUserPrompt,
} from "./prompts.js";
import { explicitConstraintFields, mergeConstraints } from "./constraints.js";
import type { NormalizedConstraints, PlannerGarment } from "./types.js";

export type ExtractConstraints = (input: {
  request: PlanningRequestInput;
  wardrobe: PlannerGarment[];
}) => Promise<NormalizedConstraints>;

export const extractConstraints: ExtractConstraints = async ({
  request,
  wardrobe,
}) => {
  const extracted = await generateNormalizedConstraints({
    systemInstruction: constraintExtractionSystemPrompt,
    userPrompt: constraintExtractionUserPrompt({
      request: request.request,
      explicit: explicitConstraintFields(request),
    }),
  });

  return mergeConstraints(extracted, request, wardrobe);
};
