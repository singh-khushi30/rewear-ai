import type { ResolvedLookPiece } from "./look";

export const garmentRoles = [
  "upper",
  "lower",
  "full",
  "outer",
  "footwear",
  "accessory",
  "other",
] as const;

export type GarmentRole = (typeof garmentRoles)[number];

export type OutfitSlots = {
  upper: ResolvedLookPiece | null;
  lower: ResolvedLookPiece | null;
  full: ResolvedLookPiece | null;
  outer: ResolvedLookPiece | null;
  footwear: ResolvedLookPiece | null;
  accessory: ResolvedLookPiece | null;
  standalone: ResolvedLookPiece | null;
  extras: ResolvedLookPiece[];
};

const fullKeywords = [
  "dress",
  "gown",
  "jumpsuit",
  "romper",
  "overall",
  "onesie",
] as const;

const outerKeywords = [
  "jacket",
  "blazer",
  "coat",
  "cardigan",
  "trench",
  "parka",
  "overcoat",
  "windbreaker",
] as const;

const footwearKeywords = [
  "sneaker",
  "heel",
  "boot",
  "sandal",
  "shoe",
  "loafer",
  "mule",
  "flats",
  "oxford",
  "pump",
  "trainer",
] as const;

const accessoryKeywords = [
  "bag",
  "belt",
  "scarf",
  "hat",
  "cap",
  "jewelry",
  "jewellery",
  "earring",
  "necklace",
  "bracelet",
  "watch",
  "sunglass",
  "glove",
  "tie",
  "purse",
  "tote",
  "clutch",
  "backpack",
  "accessory",
] as const;

const lowerKeywords = [
  "jean",
  "trouser",
  "pant",
  "skirt",
  "short",
  "legging",
  "chino",
  "culotte",
] as const;

const upperKeywords = [
  "camisole",
  "cami",
  "tank",
  "t shirt",
  "tshirt",
  "tee",
  "shirt",
  "blouse",
  "sweater",
  "hoodie",
  "top",
  "knitwear",
  "knit",
  "bodysuit",
  "vest",
  "polo",
  "pullover",
  "jumper",
  "turtleneck",
] as const;

export function normalizeGarmentCategory(category: string) {
  return category
    .trim()
    .toLowerCase()
    .replace(/[_/]+/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasKeyword(normalized: string, keywords: readonly string[]) {
  return keywords.some((keyword) => {
    const pattern = new RegExp(
      `(?:^|[^a-z0-9])${escapeRegExp(keyword)}s?(?:[^a-z0-9]|$)`,
    );
    return pattern.test(normalized);
  });
}

export function classifyGarmentRole(category: string): GarmentRole {
  const normalized = normalizeGarmentCategory(category);

  if (!normalized) {
    return "other";
  }

  if (hasKeyword(normalized, fullKeywords)) {
    return "full";
  }

  if (hasKeyword(normalized, outerKeywords)) {
    return "outer";
  }

  if (hasKeyword(normalized, footwearKeywords)) {
    return "footwear";
  }

  if (hasKeyword(normalized, accessoryKeywords)) {
    return "accessory";
  }

  if (hasKeyword(normalized, lowerKeywords)) {
    return "lower";
  }

  if (hasKeyword(normalized, upperKeywords)) {
    return "upper";
  }

  return "other";
}

function firstOfRole(
  classified: { piece: ResolvedLookPiece; role: GarmentRole }[],
  role: GarmentRole,
) {
  return classified.find((entry) => entry.role === role)?.piece ?? null;
}

export function composeOutfitSlots(pieces: ResolvedLookPiece[]): OutfitSlots {
  const owned = pieces.filter((piece) => piece.owned);
  const classified = owned.map((piece) => ({
    piece,
    role: classifyGarmentRole(piece.category),
  }));

  const full = firstOfRole(classified, "full");
  const upper = full ? null : firstOfRole(classified, "upper");
  const lower = full ? null : firstOfRole(classified, "lower");
  const outer = firstOfRole(classified, "outer");
  const footwear = firstOfRole(classified, "footwear");
  const accessory = firstOfRole(classified, "accessory");
  const firstOther = firstOfRole(classified, "other");
  const hasBody = Boolean(full || upper || lower);
  const standalone = hasBody
    ? null
    : firstOther ?? outer ?? footwear ?? accessory;

  const placed = new Set(
    [full, upper, lower, outer, footwear, accessory, standalone]
      .filter((piece): piece is ResolvedLookPiece => piece !== null)
      .map((piece) => piece.id),
  );

  return {
    upper,
    lower,
    full,
    outer,
    footwear,
    accessory,
    standalone,
    extras: owned.filter((piece) => !placed.has(piece.id)).slice(0, 2),
  };
}

export function slottedGarmentIds(slots: OutfitSlots) {
  return [
    slots.outer,
    slots.full,
    slots.upper,
    slots.lower,
    slots.standalone,
    slots.footwear,
    slots.accessory,
    ...slots.extras,
  ]
    .filter((piece): piece is ResolvedLookPiece => piece !== null)
    .filter((piece, index, all) => all.findIndex((item) => item.id === piece.id) === index)
    .map((piece) => piece.id);
}
