import { z } from "zod";

export const garmentCategories = [
  "jacket",
  "coat",
  "blazer",
  "sweater",
  "cardigan",
  "hoodie",
  "shirt",
  "blouse",
  "t-shirt",
  "top",
  "dress",
  "skirt",
  "trousers",
  "jeans",
  "shorts",
  "jumpsuit",
  "vest",
  "knitwear",
  "activewear",
  "shoes",
  "bag",
  "accessory",
  "other",
] as const;

export const garmentPatterns = [
  "solid",
  "stripe",
  "check",
  "floral",
  "abstract",
  "graphic",
  "textured",
  "other",
] as const;

export const garmentFits = [
  "slim",
  "regular",
  "relaxed",
  "oversized",
  "unknown",
] as const;

export const garmentFormalities = [
  "casual",
  "smart-casual",
  "business",
  "evening",
  "formal",
  "athletic",
] as const;

export const garmentSeasons = [
  "spring",
  "summer",
  "fall",
  "winter",
  "all-season",
] as const;

export const garmentWarmth = ["light", "medium", "heavy", "unknown"] as const;

export const materialBases = ["observed", "inferred", "unknown"] as const;

const categoryLabels: Record<(typeof garmentCategories)[number], string> = {
  jacket: "Jacket",
  coat: "Coat",
  blazer: "Blazer",
  sweater: "Sweater",
  cardigan: "Cardigan",
  hoodie: "Hoodie",
  shirt: "Shirt",
  blouse: "Blouse",
  "t-shirt": "T-shirt",
  top: "Top",
  dress: "Dress",
  skirt: "Skirt",
  trousers: "Trousers",
  jeans: "Jeans",
  shorts: "Shorts",
  jumpsuit: "Jumpsuit",
  vest: "Vest",
  knitwear: "Knitwear",
  activewear: "Activewear",
  shoes: "Shoes",
  bag: "Bag",
  accessory: "Accessory",
  other: "Other",
};

const formalityLabels: Record<(typeof garmentFormalities)[number], string> = {
  casual: "Casual",
  "smart-casual": "Smart casual",
  business: "Business",
  evening: "Evening",
  formal: "Formal",
  athletic: "Athletic",
};

const seasonLabels: Record<(typeof garmentSeasons)[number], string> = {
  spring: "Spring",
  summer: "Summer",
  fall: "Fall",
  winter: "Winter",
  "all-season": "All season",
};

const fitLabels: Record<(typeof garmentFits)[number], string> = {
  slim: "Slim",
  regular: "Regular",
  relaxed: "Relaxed",
  oversized: "Oversized",
  unknown: "Unknown",
};

export const garmentExtractionSchema = z.object({
  category: z.enum(garmentCategories),
  subcategory: z.string().trim().min(1).max(40),
  primaryColor: z.string().trim().min(1).max(40),
  material: z.string().trim().min(1).max(40),
  materialBasis: z.enum(materialBases),
  pattern: z.enum(garmentPatterns),
  silhouette: z.string().trim().min(1).max(60),
  fit: z.enum(garmentFits),
  formality: z.enum(garmentFormalities),
  season: z.enum(garmentSeasons),
  warmth: z.enum(garmentWarmth),
  styleTags: z.array(z.string().trim().min(1).max(24)).max(4),
});

export type GarmentExtraction = z.infer<typeof garmentExtractionSchema>;

export type GarmentAnalysis = {
  category: string;
  primaryColor: string;
  material: string;
  silhouette: string;
  formality: string;
  season: string;
};

export const garmentResponseJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "category",
    "subcategory",
    "primaryColor",
    "material",
    "materialBasis",
    "pattern",
    "silhouette",
    "fit",
    "formality",
    "season",
    "warmth",
    "styleTags",
  ],
  properties: {
    category: {
      type: "string",
      enum: [...garmentCategories],
      description: "Primary garment type visible in the image.",
    },
    subcategory: {
      type: "string",
      description:
        "A more specific garment name when useful, otherwise repeat the category label.",
    },
    primaryColor: {
      type: "string",
      description: "Dominant color as a short everyday name, not a hex code.",
    },
    material: {
      type: "string",
      description:
        "Conservative material description. Use Unknown, Likely knit, or Satin-like when composition cannot be confirmed.",
    },
    materialBasis: {
      type: "string",
      enum: [...materialBases],
      description:
        "observed if the surface clearly shows the material family, inferred if only a cautious guess is possible, unknown otherwise.",
    },
    pattern: {
      type: "string",
      enum: [...garmentPatterns],
    },
    silhouette: {
      type: "string",
      description: "Visible cut or shape, e.g. Midi, A-line, Boxy.",
    },
    fit: {
      type: "string",
      enum: [...garmentFits],
    },
    formality: {
      type: "string",
      enum: [...garmentFormalities],
    },
    season: {
      type: "string",
      enum: [...garmentSeasons],
    },
    warmth: {
      type: "string",
      enum: [...garmentWarmth],
      description: "Bounded warmth estimate for later weather-aware planning.",
    },
    styleTags: {
      type: "array",
      maxItems: 4,
      items: { type: "string" },
      description: "Up to four short style cues such as tailored or minimal.",
    },
  },
} as const;

export class AnalysisValidationError extends Error {
  constructor() {
    super("Garment analysis response failed validation.");
    this.name = "AnalysisValidationError";
  }
}

export function parseGarmentExtraction(value: unknown): GarmentExtraction {
  const parsed = garmentExtractionSchema.safeParse(value);
  if (!parsed.success) {
    throw new AnalysisValidationError();
  }

  return parsed.data;
}

export function toGarmentAnalysis(extraction: GarmentExtraction): GarmentAnalysis {
  const category =
    extraction.subcategory.toLowerCase() === extraction.category
      ? categoryLabels[extraction.category]
      : titleCase(extraction.subcategory);

  const material = normalizeMaterial(
    extraction.material,
    extraction.materialBasis,
  );

  const silhouette = formatSilhouette(extraction.silhouette, extraction.fit);

  return {
    category,
    primaryColor: titleCase(extraction.primaryColor),
    material,
    silhouette,
    formality: formalityLabels[extraction.formality],
    season: seasonLabels[extraction.season],
  };
}

function normalizeMaterial(
  material: string,
  basis: GarmentExtraction["materialBasis"],
) {
  const trimmed = material.trim();

  if (basis === "unknown" || /^unknown$/i.test(trimmed)) {
    return "Unknown";
  }

  if (basis === "inferred" && !/^likely\b/i.test(trimmed)) {
    if (/^satin-like$/i.test(trimmed)) {
      return "Satin-like";
    }

    return `Likely ${trimmed}`;
  }

  return trimmed;
}

function formatSilhouette(
  silhouette: string,
  fit: GarmentExtraction["fit"],
) {
  const cut = titleCase(silhouette);
  if (fit === "unknown" || fit === "regular") {
    return cut;
  }

  return `${cut} · ${fitLabels[fit]}`;
}

function titleCase(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
