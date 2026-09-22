import { createSupabaseUserClient } from "../lib/supabase.js";
import type { PlannerGarment } from "./types.js";

export class WardrobeUnavailableError extends Error {
  constructor() {
    super("Wardrobe is unavailable.");
    this.name = "WardrobeUnavailableError";
  }
}

export type LoadPlannerWardrobe = (
  accessToken: string,
) => Promise<PlannerGarment[]>;

type GarmentRow = {
  id: string;
  category: string;
  primary_color: string;
  material: string | null;
  silhouette: string | null;
  formality: string | null;
  season: string | null;
};

export const loadPlannerWardrobe: LoadPlannerWardrobe = async (accessToken) => {
  const supabase = createSupabaseUserClient(accessToken);
  if (!supabase) {
    throw new WardrobeUnavailableError();
  }

  const { data, error } = await supabase
    .from("garments")
    .select(
      "id, category, primary_color, material, silhouette, formality, season",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new WardrobeUnavailableError();
  }

  return ((data ?? []) as GarmentRow[]).map((row) => ({
    id: row.id,
    category: row.category,
    primaryColor: row.primary_color,
    material: row.material,
    silhouette: row.silhouette,
    formality: row.formality,
    season: row.season,
  }));
};
