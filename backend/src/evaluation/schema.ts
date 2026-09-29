import { z } from "zod";
import { planningRequestSchema } from "../planning/schemas.js";
import { planningModes, violationCodes } from "../planning/types.js";

export const evaluationCategories = [
  "basic",
  "capsule",
  "required",
  "exclusion",
  "repetition",
  "occasion",
  "insufficient",
  "edge",
] as const;

export type EvaluationCategory = (typeof evaluationCategories)[number];

export const expectedBehaviors = ["valid", "unsatisfiable"] as const;
export type ExpectedBehavior = (typeof expectedBehaviors)[number];

export const deterministicKinds = [
  "valid-first-pass",
  "invalid-then-valid",
  "valid-after-two-repairs",
  "grounded-unsatisfiable",
  "hallucinated-first-pass",
] as const;

export type DeterministicKind = (typeof deterministicKinds)[number];

export const expectedConstraintsSchema = z.object({
  mode: z.enum(planningModes).optional(),
  outfitCount: z.number().int().positive().max(8).nullable().optional(),
  maxPieces: z.number().int().positive().max(24).nullable().optional(),
  requiredGarmentIds: z.array(z.string().trim().min(1)).max(12).optional(),
  excludedGarmentIds: z.array(z.string().trim().min(1)).max(24).optional(),
});

export type ExpectedConstraints = z.infer<typeof expectedConstraintsSchema>;

export const evaluationScenarioSchema = z.object({
  id: z.string().trim().min(1).max(40),
  name: z.string().trim().min(1).max(80),
  category: z.enum(evaluationCategories),
  wardrobeId: z.string().trim().min(1),
  request: planningRequestSchema,
  expected: z.enum(expectedBehaviors),
  expectedConstraints: expectedConstraintsSchema.default({}),
  deterministic: z.enum(deterministicKinds),
});

export type EvaluationScenario = z.infer<typeof evaluationScenarioSchema>;

export const evalOutcomes = ["PASS", "FAIL"] as const;
export type EvalOutcome = (typeof evalOutcomes)[number];

export type ScenarioEvalResult = {
  scenarioId: string;
  name: string;
  category: EvaluationCategory;
  expected: ExpectedBehavior;
  firstPassValid: boolean | null;
  repairAttempts: number;
  finalValid: boolean;
  status: "valid" | "unsatisfied" | "empty_wardrobe" | "error";
  violations: Array<(typeof violationCodes)[number]>;
  candidatePlans: number;
  referencedIds: number;
  unknownIds: number;
  hardConstraintsApplicable: number;
  hardConstraintsSatisfied: number;
  outcome: EvalOutcome;
  reason: string;
};

export type EvalAggregate = {
  mode: "deterministic" | "live";
  total: number;
  expectedValid: number;
  expectedUnsatisfiable: number;
  firstPassValidPercent: number;
  finalValidPercent: number;
  repairRatePercent: number;
  averageRepairAttempts: number;
  unknownGarmentRatePercent: number;
  hardConstraintSatisfactionPercent: number;
  violationCounts: Record<(typeof violationCodes)[number], number>;
  outcomes: { PASS: number; FAIL: number };
  passedExpectedValid: number;
  passedExpectedUnsatisfiable: number;
  failedExpectedValid: number;
  failedExpectedUnsatisfiable: number;
};

export type EvalReport = {
  generatedAt: string;
  mode: "deterministic" | "live";
  model: string | null;
  results: ScenarioEvalResult[];
  aggregate: EvalAggregate;
};
