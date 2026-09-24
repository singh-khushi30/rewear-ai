import { z } from "zod";

export const saveLookRequestSchema = z.object({
  title: z.string().trim().min(1).max(80).optional(),
  occasion: z.string().trim().max(60).optional(),
  rationale: z.string().trim().min(1).max(2000),
  garmentIds: z
    .array(z.string().uuid())
    .min(1)
    .max(12)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Duplicate garment IDs are not allowed.",
    }),
});

export type SaveLookRequestInput = z.infer<typeof saveLookRequestSchema>;

export const savedLookIdSchema = z.string().uuid();
