/**
 * Wardrobe CRUD uses the authenticated browser Supabase client.
 * Identity is derived from the session / RLS (auth.uid()), never a
 * client-supplied user_id. Express is used for Gemini analysis and planning.
 */
import { garmentFileExtension } from "@/lib/garment-file";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { wardrobeImagesBucket } from "@/lib/supabase/env";
import type { GarmentRow } from "@/lib/supabase/database.types";
import type { GarmentAnalysis } from "@/types/garment";
import {
  listWardrobeItemsWithClient,
  WardrobeError,
} from "@/lib/wardrobe/list-garments";

export { listWardrobeItemsWithClient, WardrobeError };
export type { WardrobeItem } from "@/lib/wardrobe/list-garments";

function requireClient() {
  const supabase = createBrowserSupabaseClient();
  if (!supabase) {
    throw new WardrobeError(
      "Supabase is not configured. Add the public environment variables to continue.",
      "unconfigured",
    );
  }

  return supabase;
}

export function garmentStoragePath(
  userId: string,
  garmentId: string,
  file: File,
) {
  return `${userId}/${garmentId}.${garmentFileExtension(file)}`;
}

export async function saveGarment(input: {
  file: File;
  analysis: GarmentAnalysis;
}) {
  const supabase = requireClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new WardrobeError(
      "Your session has expired. Sign in again to save this piece.",
      "unauthenticated",
    );
  }

  const category = input.analysis.category.trim();
  const primaryColor = input.analysis.primaryColor.trim();

  if (!category || !primaryColor) {
    throw new WardrobeError(
      "Category and primary color are required before saving.",
      "insert",
    );
  }

  const id = crypto.randomUUID();
  const imagePath = garmentStoragePath(user.id, id, input.file);

  const { error: uploadError } = await supabase.storage
    .from(wardrobeImagesBucket)
    .upload(imagePath, input.file, {
      upsert: false,
      contentType: input.file.type || undefined,
    });

  if (uploadError) {
    throw new WardrobeError(
      "We couldn’t store that photograph. Try again.",
      "upload",
    );
  }

  const { error: insertError } = await supabase.from("garments").insert({
    id,
    image_path: imagePath,
    category,
    primary_color: primaryColor,
    material: emptyToNull(input.analysis.material),
    silhouette: emptyToNull(input.analysis.silhouette),
    formality: emptyToNull(input.analysis.formality),
    season: emptyToNull(input.analysis.season),
  });

  if (insertError) {
    await supabase.storage.from(wardrobeImagesBucket).remove([imagePath]);
    throw new WardrobeError(
      "The photograph uploaded, but we couldn’t save the garment. The image was removed. Try again.",
      "insert",
    );
  }

  return { id, imagePath };
}

export async function listWardrobeItems() {
  const supabase = requireClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new WardrobeError(
      "Your session has expired. Sign in again to see your wardrobe.",
      "unauthenticated",
    );
  }

  return listWardrobeItemsWithClient(supabase);
}

export async function deleteGarment(item: Pick<GarmentRow, "id" | "image_path">) {
  const supabase = requireClient();
  const { error } = await supabase.from("garments").delete().eq("id", item.id);

  if (error) {
    throw new WardrobeError(
      "We couldn’t remove that piece. Try again.",
      "delete",
    );
  }

  const { error: storageError } = await supabase.storage
    .from(wardrobeImagesBucket)
    .remove([item.image_path]);

  if (storageError) {
    throw new WardrobeError(
      "The piece was removed, but the photograph could not be deleted.",
      "delete",
    );
  }
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
