export const MAX_REPAIR_ATTEMPTS = 2;

export const planningModes = ["outfit", "capsule"] as const;
export type PlanningMode = (typeof planningModes)[number];

export const violationCodes = [
  "UNKNOWN_GARMENT",
  "EXCLUDED_GARMENT_USED",
  "REQUIRED_GARMENT_MISSING",
  "CAPSULE_LIMIT_EXCEEDED",
  "OUTFIT_COUNT_MISMATCH",
  "EMPTY_OUTFIT",
  "DUPLICATE_GARMENT_IN_OUTFIT",
  "DUPLICATE_OUTFIT",
  "OUTFIT_OUTSIDE_CAPSULE",
] as const;

export type ViolationCode = (typeof violationCodes)[number];

export type PlannerGarment = {
  id: string;
  category: string;
  primaryColor: string;
  material: string | null;
  silhouette: string | null;
  formality: string | null;
  season: string | null;
};

export type PlanningOutfit = {
  id: string;
  occasion: string;
  garmentIds: string[];
  rationale: string;
};

export type CandidatePlan = {
  mode: PlanningMode;
  capsuleGarmentIds: string[];
  outfits: PlanningOutfit[];
};

export type NormalizedConstraints = {
  mode: PlanningMode;
  outfitCount: number | null;
  maxPieces: number | null;
  occasions: string[];
  climate: string | null;
  formality: string | null;
  stylePreference: string | null;
  requiredGarmentIds: string[];
  excludedGarmentIds: string[];
  avoidRepeatOutfits: boolean;
  hardConstraints: string[];
  softPreferences: string[];
};

export type PlanViolation = {
  code: ViolationCode;
  message: string;
  details?: Record<string, unknown>;
};

export type ValidationResult = {
  valid: boolean;
  violations: PlanViolation[];
};

export type PlanningRunStatus = "valid" | "unsatisfied" | "empty_wardrobe";

export type PlanningRunResult = {
  status: PlanningRunStatus;
  plan: CandidatePlan | null;
  constraints: NormalizedConstraints | null;
  validation: ValidationResult | null;
  firstPassValid: boolean | null;
  repairAttempts: number;
  finalValid: boolean;
  violationCodes: ViolationCode[];
  message: string | null;
};
