import type { PlannerGarment } from "../planning/types.js";

function piece(
  id: string,
  category: string,
  primaryColor: string,
  extras: Partial<Omit<PlannerGarment, "id" | "category" | "primaryColor">> = {},
): PlannerGarment {
  return {
    id,
    category,
    primaryColor,
    material: extras.material ?? null,
    silhouette: extras.silhouette ?? null,
    formality: extras.formality ?? null,
    season: extras.season ?? null,
  };
}

export const evaluationWardrobes = {
  "balanced-casual": [
    piece("casual-cami-white-01", "Camisole", "White", {
      material: "Cotton",
      silhouette: "Fitted",
      formality: "Casual",
      season: "Summer",
    }),
    piece("casual-tee-navy-01", "T-shirt", "Navy", {
      material: "Cotton",
      silhouette: "Relaxed",
      formality: "Casual",
      season: "All season",
    }),
    piece("casual-shirt-stripe-01", "Shirt", "Blue", {
      material: "Cotton",
      silhouette: "Relaxed",
      formality: "Smart casual",
      season: "All season",
    }),
    piece("casual-jeans-indigo-01", "Jeans", "Indigo", {
      material: "Denim",
      silhouette: "Straight",
      formality: "Casual",
      season: "All season",
    }),
    piece("casual-skirt-denim-01", "Skirt", "Indigo", {
      material: "Denim",
      silhouette: "A-line",
      formality: "Casual",
      season: "Summer",
    }),
    piece("casual-trouser-stone-01", "Trousers", "Stone", {
      material: "Cotton",
      silhouette: "Wide",
      formality: "Smart casual",
      season: "All season",
    }),
    piece("casual-cardigan-cream-01", "Cardigan", "Cream", {
      material: "Knit",
      silhouette: "Relaxed",
      formality: "Casual",
      season: "Cool",
    }),
    piece("casual-jacket-olive-01", "Jacket", "Olive", {
      material: "Cotton",
      silhouette: "Utility",
      formality: "Casual",
      season: "All season",
    }),
    piece("casual-sneaker-white-01", "Sneakers", "White", {
      material: "Canvas",
      silhouette: "Low",
      formality: "Casual",
      season: "All season",
    }),
    piece("casual-loafer-tan-01", "Loafers", "Tan", {
      material: "Leather",
      silhouette: "Classic",
      formality: "Smart casual",
      season: "All season",
    }),
  ],
  work: [
    piece("work-blouse-ivory-01", "Blouse", "Ivory", {
      material: "Silk",
      silhouette: "Relaxed",
      formality: "Work",
      season: "All season",
    }),
    piece("work-shirt-blue-01", "Shirt", "Blue", {
      material: "Cotton",
      silhouette: "Tailored",
      formality: "Work",
      season: "All season",
    }),
    piece("work-knit-charcoal-01", "Knit", "Charcoal", {
      material: "Wool",
      silhouette: "Fitted",
      formality: "Smart casual",
      season: "Cool",
    }),
    piece("work-trouser-black-01", "Trousers", "Black", {
      material: "Wool",
      silhouette: "Tailored",
      formality: "Work",
      season: "All season",
    }),
    piece("work-trouser-navy-01", "Trousers", "Navy", {
      material: "Wool",
      silhouette: "Straight",
      formality: "Work",
      season: "All season",
    }),
    piece("work-blazer-navy-01", "Blazer", "Navy", {
      material: "Wool",
      silhouette: "Structured",
      formality: "Work",
      season: "Cool",
    }),
    piece("work-loafer-brown-01", "Loafers", "Brown", {
      material: "Leather",
      silhouette: "Classic",
      formality: "Smart casual",
      season: "All season",
    }),
    piece("work-heel-black-01", "Heels", "Black", {
      material: "Leather",
      silhouette: "Pump",
      formality: "Work",
      season: "All season",
    }),
  ],
  small: [
    piece("small-tee-white-01", "T-shirt", "White", {
      material: "Cotton",
      silhouette: "Relaxed",
      formality: "Casual",
      season: "All season",
    }),
    piece("small-jean-indigo-01", "Jeans", "Indigo", {
      material: "Denim",
      silhouette: "Straight",
      formality: "Casual",
      season: "All season",
    }),
    piece("small-cardigan-grey-01", "Cardigan", "Grey", {
      material: "Knit",
      silhouette: "Relaxed",
      formality: "Casual",
      season: "Cool",
    }),
    piece("small-sneaker-black-01", "Sneakers", "Black", {
      material: "Leather",
      silhouette: "Low",
      formality: "Casual",
      season: "All season",
    }),
  ],
  "capsule-friendly": [
    piece("cap-tee-white-01", "T-shirt", "White", {
      material: "Cotton",
      silhouette: "Fitted",
      formality: "Casual",
      season: "All season",
    }),
    piece("cap-shirt-stripe-01", "Shirt", "Blue", {
      material: "Cotton",
      silhouette: "Relaxed",
      formality: "Smart casual",
      season: "All season",
    }),
    piece("cap-jean-indigo-01", "Jeans", "Indigo", {
      material: "Denim",
      silhouette: "Straight",
      formality: "Casual",
      season: "All season",
    }),
    piece("cap-trouser-black-01", "Trousers", "Black", {
      material: "Wool",
      silhouette: "Tailored",
      formality: "Work",
      season: "All season",
    }),
    piece("cap-blazer-navy-01", "Blazer", "Navy", {
      material: "Wool",
      silhouette: "Structured",
      formality: "Work",
      season: "Cool",
    }),
    piece("cap-cardigan-cream-01", "Cardigan", "Cream", {
      material: "Knit",
      silhouette: "Relaxed",
      formality: "Casual",
      season: "Cool",
    }),
    piece("cap-sneaker-white-01", "Sneakers", "White", {
      material: "Canvas",
      silhouette: "Low",
      formality: "Casual",
      season: "All season",
    }),
    piece("cap-loafer-brown-01", "Loafers", "Brown", {
      material: "Leather",
      silhouette: "Classic",
      formality: "Smart casual",
      season: "All season",
    }),
  ],
  "dress-heavy": [
    piece("dress-slip-black-01", "Dress", "Black", {
      material: "Satin",
      silhouette: "Slip",
      formality: "Evening",
      season: "All season",
    }),
    piece("dress-shirt-navy-01", "Dress", "Navy", {
      material: "Cotton",
      silhouette: "Shirt",
      formality: "Work",
      season: "All season",
    }),
    piece("dress-knit-olive-01", "Dress", "Olive", {
      material: "Knit",
      silhouette: "Midi",
      formality: "Casual",
      season: "Cool",
    }),
    piece("dress-cardigan-cream-01", "Cardigan", "Cream", {
      material: "Knit",
      silhouette: "Relaxed",
      formality: "Casual",
      season: "Cool",
    }),
    piece("dress-heel-black-01", "Heels", "Black", {
      material: "Leather",
      silhouette: "Pump",
      formality: "Evening",
      season: "All season",
    }),
    piece("dress-bag-tan-01", "Bag", "Tan", {
      material: "Leather",
      silhouette: "Tote",
      formality: "Smart casual",
      season: "All season",
    }),
  ],
  "tops-dominated": [
    piece("tops-cami-white-01", "Camisole", "White", {
      formality: "Casual",
      season: "Summer",
    }),
    piece("tops-tee-black-01", "T-shirt", "Black", {
      formality: "Casual",
      season: "All season",
    }),
    piece("tops-tee-grey-01", "T-shirt", "Grey", {
      formality: "Casual",
      season: "All season",
    }),
    piece("tops-hoodie-navy-01", "Hoodie", "Navy", {
      formality: "Casual",
      season: "Cool",
    }),
    piece("tops-sweater-cream-01", "Sweater", "Cream", {
      formality: "Casual",
      season: "Cool",
    }),
    piece("tops-jean-indigo-01", "Jeans", "Indigo", {
      formality: "Casual",
      season: "All season",
    }),
    piece("tops-sneaker-white-01", "Sneakers", "White", {
      formality: "Casual",
      season: "All season",
    }),
  ],
  "one-garment": [
    piece("solo-dress-black-01", "Dress", "Black", {
      material: "Crepe",
      silhouette: "Midi",
      formality: "Evening",
      season: "All season",
    }),
  ],
  "dress-only": [
    piece("only-dress-black-01", "Dress", "Black", {
      formality: "Evening",
      season: "All season",
    }),
    piece("only-dress-navy-01", "Dress", "Navy", {
      formality: "Work",
      season: "All season",
    }),
  ],
} as const satisfies Record<string, PlannerGarment[]>;

export type WardrobeId = keyof typeof evaluationWardrobes;

export function getEvaluationWardrobe(id: string): PlannerGarment[] {
  const wardrobe = evaluationWardrobes[id as WardrobeId];
  if (!wardrobe) {
    throw new Error(`Unknown evaluation wardrobe: ${id}`);
  }

  return [...wardrobe];
}
