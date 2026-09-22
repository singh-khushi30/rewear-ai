import { generateCandidatePlan } from "./llm.js";
import { repairSystemPrompt, repairUserPrompt } from "./prompts.js";
import type {
  CandidatePlan,
  NormalizedConstraints,
  PlannerGarment,
  ValidationResult,
} from "./types.js";

export type RepairCandidatePlan = (input: {
  request: string;
  constraints: NormalizedConstraints;
  wardrobe: PlannerGarment[];
  previousPlan: CandidatePlan;
  validation: ValidationResult;
}) => Promise<CandidatePlan>;

export const repairCandidatePlan: RepairCandidatePlan = async (input) => {
  return generateCandidatePlan({
    systemInstruction: repairSystemPrompt,
    userPrompt: repairUserPrompt(input),
  });
};
