import { Annotation } from "@langchain/langgraph";
import type { PlanningRequestInput } from "./schemas.js";
import type {
  CandidatePlan,
  NormalizedConstraints,
  PlannerGarment,
  PlanningRunStatus,
  ValidationResult,
} from "./types.js";

export const PlanningAnnotation = Annotation.Root({
  request: Annotation<PlanningRequestInput>,
  wardrobe: Annotation<PlannerGarment[]>,
  constraints: Annotation<NormalizedConstraints | null>({
    reducer: (_left, right) => right,
    default: () => null,
  }),
  candidatePlan: Annotation<CandidatePlan | null>({
    reducer: (_left, right) => right,
    default: () => null,
  }),
  validation: Annotation<ValidationResult | null>({
    reducer: (_left, right) => right,
    default: () => null,
  }),
  repairAttempts: Annotation<number>({
    reducer: (_left, right) => right,
    default: () => 0,
  }),
  firstPassValid: Annotation<boolean | null>({
    reducer: (_left, right) => right,
    default: () => null,
  }),
  status: Annotation<PlanningRunStatus | "running">({
    reducer: (_left, right) => right,
    default: () => "running",
  }),
  message: Annotation<string | null>({
    reducer: (_left, right) => right,
    default: () => null,
  }),
});

export type PlanningState = typeof PlanningAnnotation.State;
export type PlanningUpdate = typeof PlanningAnnotation.Update;
