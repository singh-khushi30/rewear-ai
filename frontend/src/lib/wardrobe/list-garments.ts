import type { SupabaseClient } from "@supabase/supabase-js";
import type { GarmentRow } from "@/lib/supabase/database.types";
import { wardrobeImagesBucket } from "@/lib/supabase/env";

export type WardrobeClient = SupabaseClient;

export type WardrobeItem = GarmentRow & {
  imageUrl: string | null;
};

export class WardrobeError extends Error {
  constructor(
    message: string,
    readonly code:
      | "unauthenticated"
      | "unconfigured"
      | "upload"
      | "insert"
      | "fetch"
      | "signed-url"
      | "delete",
  ) {
    super(message);
    this.name = "WardrobeError";
  }
}

export async function listWardrobeItemsWithClient(
  supabase: WardrobeClient,
): Promise<WardrobeItem[]> {
  const { data, error } = await supabase
    .from("garments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new WardrobeError(
      "We couldn’t load your wardrobe. Try again shortly.",
      "fetch",
    );
  }

  const garments = (data ?? []) as GarmentRow[];
  if (garments.length === 0) {
    return [];
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from(wardrobeImagesBucket)
    .createSignedUrls(
      garments.map((garment) => garment.image_path),
      60 * 60,
    );

  if (signedError) {
    throw new WardrobeError(
      "Your wardrobe loaded, but we couldn’t open the photographs.",
      "signed-url",
    );
  }

  const urls = new Map(
    (signed ?? []).map((item) => [item.path, item.signedUrl ?? null]),
  );

  return garments.map((garment) => ({
    ...garment,
    imageUrl: urls.get(garment.image_path) ?? null,
  }));
}
