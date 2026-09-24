import { createSupabaseUserClient } from "../lib/supabase.js";
import { LooksUnavailableError } from "./errors.js";
import { lookFingerprint } from "./fingerprint.js";
import type {
  DeleteLook,
  GetLook,
  ListLooks,
  LoadOwnedGarments,
  OwnedGarment,
  SaveLook,
  SavedLookPiece,
  SavedLookRecord,
} from "./types.js";

const wardrobeImagesBucket = "wardrobe-images";

type LookRow = {
  id: string;
  title: string;
  occasion: string;
  rationale: string;
  created_at: string;
};

type GarmentJoin = {
  id: string;
  category: string;
  primary_color: string;
  image_path: string;
};

type ItemRow = {
  saved_look_id: string;
  position: number;
  garment_id: string;
  garments: GarmentJoin | GarmentJoin[] | null;
};

function unwrapGarment(value: ItemRow["garments"]) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

export function defaultLookTitle(occasion: string) {
  const trimmed = occasion.trim();
  return trimmed.length > 0 ? trimmed : "Saved look";
}

export const loadOwnedGarments: LoadOwnedGarments = async (
  accessToken,
  garmentIds,
) => {
  const supabase = createSupabaseUserClient(accessToken);
  if (!supabase) {
    throw new LooksUnavailableError();
  }

  const { data, error } = await supabase
    .from("garments")
    .select("id, category, primary_color, image_path")
    .in("id", garmentIds);

  if (error) {
    throw new LooksUnavailableError();
  }

  const byId = new Map(
    ((data ?? []) as OwnedGarmentRow[]).map((row) => [row.id, row]),
  );

  return garmentIds.flatMap((id) => {
    const row = byId.get(id);
    if (!row) {
      return [];
    }

    return [
      {
        id: row.id,
        category: row.category,
        primaryColor: row.primary_color,
        imagePath: row.image_path,
      } satisfies OwnedGarment,
    ];
  });
};

type OwnedGarmentRow = {
  id: string;
  category: string;
  primary_color: string;
  image_path: string;
};

export const saveLook: SaveLook = async (input) => {
  const supabase = createSupabaseUserClient(input.accessToken);
  if (!supabase) {
    throw new LooksUnavailableError();
  }

  const fingerprint = lookFingerprint(input.garmentIds);
  const { data, error } = await supabase
    .from("saved_looks")
    .insert({
      title: input.title,
      occasion: input.occasion,
      rationale: input.rationale,
      fingerprint,
    })
    .select("id, title, occasion, rationale, created_at")
    .single();

  if (error?.code === "23505") {
    const existing = await getLookByFingerprint(input.accessToken, fingerprint);
    if (existing) {
      return existing;
    }

    throw new LooksUnavailableError();
  }

  if (error || !data) {
    throw new LooksUnavailableError();
  }

  const look = data as LookRow;
  const { error: itemsError } = await supabase.from("saved_look_items").insert(
    input.garmentIds.map((garmentId, position) => ({
      saved_look_id: look.id,
      garment_id: garmentId,
      position,
    })),
  );

  if (itemsError) {
    await supabase.from("saved_looks").delete().eq("id", look.id);
    throw new LooksUnavailableError();
  }

  const saved = await getLook(input.accessToken, look.id);
  if (!saved) {
    throw new LooksUnavailableError();
  }

  return saved;
};

export const listLooks: ListLooks = async (accessToken) => {
  const supabase = createSupabaseUserClient(accessToken);
  if (!supabase) {
    throw new LooksUnavailableError();
  }

  const { data, error } = await supabase
    .from("saved_looks")
    .select("id, title, occasion, rationale, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new LooksUnavailableError();
  }

  const looks = (data ?? []) as LookRow[];
  if (looks.length === 0) {
    return [];
  }

  return assembleLooks(
    accessToken,
    looks,
    looks.map((look) => look.id),
  );
};

export const getLook: GetLook = async (accessToken, lookId) => {
  const supabase = createSupabaseUserClient(accessToken);
  if (!supabase) {
    throw new LooksUnavailableError();
  }

  const { data, error } = await supabase
    .from("saved_looks")
    .select("id, title, occasion, rationale, created_at")
    .eq("id", lookId)
    .maybeSingle();

  if (error) {
    throw new LooksUnavailableError();
  }

  if (!data) {
    return null;
  }

  const assembled = await assembleLooks(accessToken, [data as LookRow], [
    (data as LookRow).id,
  ]);
  return assembled[0] ?? null;
};

async function getLookByFingerprint(accessToken: string, fingerprint: string) {
  const supabase = createSupabaseUserClient(accessToken);
  if (!supabase) {
    throw new LooksUnavailableError();
  }

  const { data, error } = await supabase
    .from("saved_looks")
    .select("id, title, occasion, rationale, created_at")
    .eq("fingerprint", fingerprint)
    .maybeSingle();

  if (error) {
    throw new LooksUnavailableError();
  }

  if (!data) {
    return null;
  }

  const assembled = await assembleLooks(accessToken, [data as LookRow], [
    (data as LookRow).id,
  ]);
  return assembled[0] ?? null;
}

export const deleteLook: DeleteLook = async (accessToken, lookId) => {
  const supabase = createSupabaseUserClient(accessToken);
  if (!supabase) {
    throw new LooksUnavailableError();
  }

  const { data, error } = await supabase
    .from("saved_looks")
    .delete()
    .eq("id", lookId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new LooksUnavailableError();
  }

  return Boolean(data);
};

async function assembleLooks(
  accessToken: string,
  looks: LookRow[],
  lookIds: string[],
): Promise<SavedLookRecord[]> {
  const supabase = createSupabaseUserClient(accessToken);
  if (!supabase) {
    throw new LooksUnavailableError();
  }

  const { data, error } = await supabase
    .from("saved_look_items")
    .select(
      "saved_look_id, position, garment_id, garments ( id, category, primary_color, image_path )",
    )
    .in("saved_look_id", lookIds)
    .order("position", { ascending: true });

  if (error) {
    throw new LooksUnavailableError();
  }

  const items = (data ?? []) as unknown as ItemRow[];
  const imageUrls = await signGarmentImages(
    accessToken,
    items
      .map((item) => unwrapGarment(item.garments)?.image_path)
      .filter((path): path is string => Boolean(path)),
  );

  const piecesByLook = new Map<string, SavedLookPiece[]>();
  for (const item of items) {
    const garment = unwrapGarment(item.garments);
    if (!garment) {
      continue;
    }

    const pieces = piecesByLook.get(item.saved_look_id) ?? [];
    pieces.push({
      id: garment.id,
      category: garment.category,
      primaryColor: garment.primary_color,
      imageUrl: imageUrls.get(garment.image_path) ?? null,
    });
    piecesByLook.set(item.saved_look_id, pieces);
  }

  return looks.map((look) => ({
    id: look.id,
    title: look.title,
    occasion: look.occasion,
    rationale: look.rationale,
    createdAt: look.created_at,
    pieces: piecesByLook.get(look.id) ?? [],
  }));
}

async function signGarmentImages(accessToken: string, paths: string[]) {
  const unique = [...new Set(paths)];
  if (unique.length === 0) {
    return new Map<string, string | null>();
  }

  const supabase = createSupabaseUserClient(accessToken);
  if (!supabase) {
    throw new LooksUnavailableError();
  }

  const { data, error } = await supabase.storage
    .from(wardrobeImagesBucket)
    .createSignedUrls(unique, 60 * 60);

  if (error) {
    throw new LooksUnavailableError();
  }

  return new Map(
    (data ?? []).map((item) => [item.path, item.signedUrl ?? null]),
  );
}
