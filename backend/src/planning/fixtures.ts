import type {
  CandidatePlan,
  NormalizedConstraints,
  PlannerGarment,
} from "./types.js";

export const wardrobe: PlannerGarment[] = [
  {
    id: "top-1",
    category: "Blouse",
    primaryColor: "Ivory",
    material: "Silk",
    silhouette: "Relaxed",
    formality: "Smart casual",
    season: "All season",
  },
  {
    id: "top-2",
    category: "Knit",
    primaryColor: "Charcoal",
    material: "Wool",
    silhouette: "Fitted",
    formality: "Casual",
    season: "Cool",
  },
  {
    id: "bottom-1",
    category: "Trousers",
    primaryColor: "Black",
    material: "Wool",
    silhouette: "Tailored",
    formality: "Work",
    season: "All season",
  },
  {
    id: "bottom-2",
    category: "Jeans",
    primaryColor: "Indigo",
    material: "Denim",
    silhouette: "Straight",
    formality: "Casual",
    season: "All season",
  },
  {
    id: "outer-1",
    category: "Blazer",
    primaryColor: "Navy",
    material: "Wool",
    silhouette: "Structured",
    formality: "Work",
    season: "Cool",
  },
  {
    id: "shoe-1",
    category: "Loafers",
    primaryColor: "Brown",
    material: "Leather",
    silhouette: "Classic",
    formality: "Smart casual",
    season: "All season",
  },
];

export function outfitConstraints(
  overrides: Partial<NormalizedConstraints> = {},
): NormalizedConstraints {
  return {
    mode: "outfit",
    outfitCount: 2,
    maxPieces: null,
    occasions: ["work"],
    climate: null,
    formality: "smart casual",
    stylePreference: null,
    requiredGarmentIds: [],
    excludedGarmentIds: [],
    avoidRepeatOutfits: true,
    hardConstraints: ["2 outfits"],
    softPreferences: ["smart casual"],
    ...overrides,
  };
}

export function capsuleConstraints(
  overrides: Partial<NormalizedConstraints> = {},
): NormalizedConstraints {
  return {
    mode: "capsule",
    outfitCount: 2,
    maxPieces: 4,
    occasions: ["daytime", "dinner"],
    climate: "cool",
    formality: null,
    stylePreference: null,
    requiredGarmentIds: [],
    excludedGarmentIds: [],
    avoidRepeatOutfits: true,
    hardConstraints: ["maximum 4 pieces"],
    softPreferences: [],
    ...overrides,
  };
}

export function validOutfitPlan(): CandidatePlan {
  return {
    mode: "outfit",
    capsuleGarmentIds: [],
    outfits: [
      {
        id: "look-1",
        occasion: "Work",
        garmentIds: ["top-1", "bottom-1", "shoe-1"],
        rationale: "Polished enough for the office without feeling stiff.",
      },
      {
        id: "look-2",
        occasion: "Work",
        garmentIds: ["top-2", "bottom-1", "outer-1"],
        rationale: "A darker knit keeps the trousers in weekday rotation.",
      },
    ],
  };
}

export function validCapsulePlan(): CandidatePlan {
  return {
    mode: "capsule",
    capsuleGarmentIds: ["top-1", "top-2", "bottom-1", "shoe-1"],
    outfits: [
      {
        id: "look-1",
        occasion: "Daytime",
        garmentIds: ["top-2", "bottom-1", "shoe-1"],
        rationale: "Casual knit over tailored trousers for the day.",
      },
      {
        id: "look-2",
        occasion: "Dinner",
        garmentIds: ["top-1", "bottom-1", "shoe-1"],
        rationale: "The ivory blouse lifts the same trousers for dinner.",
      },
    ],
  };
}
