import { z } from "zod";
import { planningModes, violationCodes } from "./types.js";

export const planningRequestSchema = z.object({
  request: z.string().trim().min(1).max(1000),
  mode: z.enum(planningModes).optional(),
  outfitCount: z.number().int().positive().max(8).optional(),
  maxPieces: z.number().int().positive().max(24).optional(),
  occasions: z.array(z.string().trim().min(1).max(40)).max(8).optional(),
  climate: z.string().trim().min(1).max(80).optional(),
  formality: z.string().trim().min(1).max(40).optional(),
  stylePreference: z.string().trim().min(1).max(40).optional(),
  requiredGarmentIds: z.array(z.string().trim().min(1)).max(12).optional(),
  excludedGarmentIds: z.array(z.string().trim().min(1)).max(24).optional(),
  avoidRepeatOutfits: z.boolean().optional(),
});

export type PlanningRequestInput = z.infer<typeof planningRequestSchema>;

export const normalizedConstraintsSchema = z.object({
  mode: z.enum(planningModes),
  outfitCount: z.number().int().positive().max(8).nullable(),
  maxPieces: z.number().int().positive().max(24).nullable(),
  occasions: z.array(z.string().trim().min(1).max(40)).max(8),
  climate: z.string().trim().min(1).max(80).nullable(),
  formality: z.string().trim().min(1).max(40).nullable(),
  stylePreference: z.string().trim().min(1).max(40).nullable(),
  requiredGarmentIds: z.array(z.string().trim().min(1)).max(12),
  excludedGarmentIds: z.array(z.string().trim().min(1)).max(24),
  avoidRepeatOutfits: z.boolean(),
  hardConstraints: z.array(z.string().trim().min(1).max(80)).max(12),
  softPreferences: z.array(z.string().trim().min(1).max(80)).max(12),
});

export const candidatePlanSchema = z.object({
  mode: z.enum(planningModes),
  capsuleGarmentIds: z.array(z.string().trim().min(1)).max(24),
  outfits: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(40),
        occasion: z.string().trim().min(1).max(60),
        garmentIds: z.array(z.string().trim().min(1)).max(12),
        rationale: z.string().trim().min(1).max(220),
      }),
    )
    .max(8),
});

export const validationResultSchema = z.object({
  valid: z.boolean(),
  violations: z.array(
    z.object({
      code: z.enum(violationCodes),
      message: z.string(),
      details: z.record(z.string(), z.unknown()).optional(),
    }),
  ),
});

export const constraintsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "mode",
    "outfitCount",
    "maxPieces",
    "occasions",
    "climate",
    "formality",
    "stylePreference",
    "requiredGarmentIds",
    "excludedGarmentIds",
    "avoidRepeatOutfits",
    "hardConstraints",
    "softPreferences",
  ],
  properties: {
    mode: { type: "string", enum: ["outfit", "capsule"] },
    outfitCount: { type: ["integer", "null"] },
    maxPieces: { type: ["integer", "null"] },
    occasions: { type: "array", items: { type: "string" } },
    climate: { type: ["string", "null"] },
    formality: { type: ["string", "null"] },
    stylePreference: { type: ["string", "null"] },
    requiredGarmentIds: { type: "array", items: { type: "string" } },
    excludedGarmentIds: { type: "array", items: { type: "string" } },
    avoidRepeatOutfits: { type: "boolean" },
    hardConstraints: { type: "array", items: { type: "string" } },
    softPreferences: { type: "array", items: { type: "string" } },
  },
} as const;

export const candidatePlanJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["mode", "capsuleGarmentIds", "outfits"],
  properties: {
    mode: { type: "string", enum: ["outfit", "capsule"] },
    capsuleGarmentIds: { type: "array", items: { type: "string" } },
    outfits: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "occasion", "garmentIds", "rationale"],
        properties: {
          id: { type: "string" },
          occasion: { type: "string" },
          garmentIds: { type: "array", items: { type: "string" } },
          rationale: { type: "string" },
        },
      },
    },
  },
} as const;

export class PlanningParseError extends Error {
  constructor() {
    super("Planning model output failed validation.");
    this.name = "PlanningParseError";
  }
}

export function parseNormalizedConstraints(value: unknown) {
  const parsed = normalizedConstraintsSchema.safeParse(value);
  if (!parsed.success) {
    throw new PlanningParseError();
  }
  return parsed.data;
}

export function parseCandidatePlan(value: unknown) {
  const parsed = candidatePlanSchema.safeParse(value);
  if (!parsed.success) {
    throw new PlanningParseError();
  }
  return parsed.data;
}
