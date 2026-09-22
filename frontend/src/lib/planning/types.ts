export const planningModes = ["outfit", "capsule"] as const;
export type PlanningMode = (typeof planningModes)[number];

export type PlanningOutfit = {
  id: string;
  occasion: string;
  garmentIds: string[];
  rationale: string;
};

export type PlanningPlan = {
  mode: PlanningMode;
  capsuleGarmentIds: string[];
  outfits: PlanningOutfit[];
};

export type PlanningConstraints = {
  mode: PlanningMode;
  outfitCount: number | null;
  maxPieces: number | null;
  occasions: string[];
  climate: string | null;
  formality: string | null;
  stylePreference: string | null;
};

export type PlanningMeta = {
  lookCount: number;
  piecesUsed: number;
  repaired: boolean;
};

export type PlanningSuccess = {
  success: true;
  status: "valid";
  plan: PlanningPlan;
  constraints: PlanningConstraints | null;
  meta: PlanningMeta;
};

export type PlanningProgress = {
  id: string;
  label: string;
  index: number;
  total: number;
};
