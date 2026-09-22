import { generateCandidatePlan } from "./llm.js";
import { plannerSystemPrompt, plannerUserPrompt } from "./prompts.js";
import type {
  CandidatePlan,
  NormalizedConstraints,
  PlannerGarment,
} from "./types.js";

export type BuildCandidatePlan = (input: {
  request: string;
  constraints: NormalizedConstraints;
  wardrobe: PlannerGarment[];
}) => Promise<CandidatePlan>;

export const buildCandidatePlan: BuildCandidatePlan = async (input) => {
  return generateCandidatePlan({
    systemInstruction: plannerSystemPrompt,
    userPrompt: plannerUserPrompt(input),
  });
};
