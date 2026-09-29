import type {
  CandidatePlan,
  NormalizedConstraints,
  PlannerGarment,
} from "../planning/types.js";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function isFull(garment: PlannerGarment) {
  const text = normalize(garment.category);
  return /dress|jumpsuit|romper/.test(text);
}

function isLower(garment: PlannerGarment) {
  const text = normalize(garment.category);
  return /jean|trouser|pant|skirt|short/.test(text);
}

function isOuter(garment: PlannerGarment) {
  const text = normalize(garment.category);
  return /jacket|blazer|coat|cardigan/.test(text);
}

function isShoe(garment: PlannerGarment) {
  const text = normalize(garment.category);
  return /sneaker|loafer|heel|boot|sandal|shoe/.test(text);
}

function isUpper(garment: PlannerGarment) {
  if (isFull(garment) || isLower(garment) || isOuter(garment) || isShoe(garment)) {
    return false;
  }

  const text = normalize(garment.category);
  return /cami|tee|t-shirt|shirt|blouse|knit|sweater|hoodie|top/.test(text);
}

function take(
  garments: PlannerGarment[],
  predicate: (garment: PlannerGarment) => boolean,
  offset = 0,
) {
  const matches = garments.filter(predicate);
  if (matches.length === 0) {
    return null;
  }

  return matches[offset % matches.length] ?? null;
}

function takeAt(garments: PlannerGarment[], offset: number) {
  if (garments.length === 0) {
    return null;
  }

  return garments[offset % garments.length] ?? null;
}

function uniqueIds(ids: Array<string | null | undefined>) {
  return [...new Set(ids.filter((id): id is string => Boolean(id)))];
}

export function composeOutfitIds(
  wardrobe: PlannerGarment[],
  offset = 0,
  extra?: { requireId?: string; excludeIds?: string[] },
) {
  const excluded = new Set(extra?.excludeIds ?? []);
  const available = wardrobe.filter((garment) => !excluded.has(garment.id));
  const uppers = available.filter(isUpper);
  const lowers = available.filter(isLower);
  const fulls = available.filter(isFull);
  const outers = available.filter(isOuter);
  const shoes = available.filter(isShoe);
  const upperOffset = offset;
  const lowerOffset = Math.floor(offset / Math.max(uppers.length, 1));
  const shoeOffset = Math.floor(
    offset / Math.max(uppers.length * Math.max(lowers.length, 1), 1),
  );
  const fullOffset = offset;
  const required = extra?.requireId
    ? available.find((garment) => garment.id === extra.requireId)
    : undefined;

  if (required && isFull(required)) {
    return uniqueIds([
      required.id,
      takeAt(outers, offset)?.id,
      takeAt(shoes, shoeOffset)?.id,
    ]);
  }

  if (required && isLower(required)) {
    return uniqueIds([
      takeAt(uppers, upperOffset)?.id,
      required.id,
      takeAt(shoes, shoeOffset)?.id,
    ]);
  }

  if (required && isOuter(required)) {
    const body = takeAt(fulls, fullOffset);
    if (body) {
      return uniqueIds([body.id, required.id, takeAt(shoes, shoeOffset)?.id]);
    }

    return uniqueIds([
      takeAt(uppers, upperOffset)?.id,
      takeAt(lowers, lowerOffset)?.id,
      required.id,
    ]);
  }

  if (required) {
    return uniqueIds([
      required.id,
      takeAt(lowers, lowerOffset)?.id,
      takeAt(shoes, shoeOffset)?.id,
    ]);
  }

  const full = takeAt(fulls, fullOffset);
  if (full && lowers.length === 0) {
    return uniqueIds([
      full.id,
      takeAt(outers, offset)?.id,
      takeAt(shoes, shoeOffset)?.id,
    ]);
  }

  const upper = takeAt(uppers, upperOffset);
  const lower = takeAt(lowers, lowerOffset);
  if (upper && lower) {
    return uniqueIds([
      upper.id,
      lower.id,
      takeAt(shoes, shoeOffset)?.id,
    ]);
  }

  if (full) {
    return uniqueIds([
      full.id,
      takeAt(outers, offset)?.id,
      takeAt(shoes, shoeOffset)?.id,
    ]);
  }

  return uniqueIds([
    upper?.id,
    lower?.id,
    takeAt(outers, offset)?.id,
    takeAt(shoes, shoeOffset)?.id,
    available[offset % Math.max(available.length, 1)]?.id,
  ]).slice(0, 3);
}

function selectPool(
  wardrobe: PlannerGarment[],
  constraints: NormalizedConstraints,
) {
  const excluded = new Set(constraints.excludedGarmentIds);
  const available = wardrobe.filter((garment) => !excluded.has(garment.id));

  if (constraints.mode !== "capsule" || constraints.maxPieces === null) {
    return available;
  }

  const picked: PlannerGarment[] = [];
  const add = (garment: PlannerGarment | null | undefined) => {
    if (
      !garment ||
      picked.some((item) => item.id === garment.id) ||
      picked.length >= constraints.maxPieces!
    ) {
      return;
    }

    picked.push(garment);
  };

  for (const id of constraints.requiredGarmentIds) {
    add(available.find((garment) => garment.id === id));
  }

  add(take(available, isUpper, 0));
  add(take(available, isLower, 0));
  add(take(available, isFull, 0));
  add(take(available, isShoe, 0));
  add(take(available, isOuter, 0));
  add(take(available, isUpper, 1));
  add(take(available, isLower, 1));
  add(take(available, isShoe, 1));
  add(take(available, isOuter, 1));

  for (const garment of available) {
    add(garment);
  }

  return picked;
}

export function composeValidPlan(
  wardrobe: PlannerGarment[],
  constraints: NormalizedConstraints,
): CandidatePlan {
  const pool = selectPool(wardrobe, constraints);
  const outfitCount = constraints.outfitCount ?? 1;
  const outfits = [];
  const seen = new Set<string>();

  for (let index = 0; index < outfitCount; index += 1) {
    let ids = composeOutfitIds(pool, index, {
      requireId: constraints.requiredGarmentIds[0],
      excludeIds: constraints.excludedGarmentIds,
    });

    if (ids.length === 0 && pool[0]) {
      ids = [pool[0].id];
    }

    let signature = [...ids].sort().join("|");
    let spin = 1;
    while (seen.has(signature) && spin < pool.length * 4) {
      ids = composeOutfitIds(pool, index + spin, {
        requireId: constraints.requiredGarmentIds[0],
        excludeIds: constraints.excludedGarmentIds,
      });

      const unused = pool.find((garment) => !ids.includes(garment.id));
      if (seen.has([...ids].sort().join("|")) && unused) {
        ids = uniqueIds([...ids, unused.id]);
      }

      signature = [...ids].sort().join("|");
      spin += 1;
    }

    seen.add(signature);
    outfits.push({
      id: `look-${index + 1}`,
      occasion: constraints.occasions[index] ?? constraints.occasions[0] ?? "Everyday",
      garmentIds: ids,
      rationale: "Deterministic evaluation candidate assembled from the fixture wardrobe.",
    });
  }

  const used = uniqueIds(outfits.flatMap((outfit) => outfit.garmentIds));

  return {
    mode: constraints.mode,
    capsuleGarmentIds: constraints.mode === "capsule" ? used : [],
    outfits,
  };
}

export function withUnknownGarment(plan: CandidatePlan): CandidatePlan {
  const outfits = plan.outfits.map((outfit, index) =>
    index === 0
      ? {
          ...outfit,
          garmentIds: [...outfit.garmentIds, "ghost-coat-99"],
        }
      : outfit,
  );

  return { ...plan, outfits };
}

export function withDuplicateOutfit(plan: CandidatePlan): CandidatePlan {
  if (plan.outfits.length < 2) {
    return {
      ...plan,
      outfits: [
        ...plan.outfits,
        {
          id: "look-dup",
          occasion: "Everyday",
          garmentIds: [...(plan.outfits[0]?.garmentIds ?? [])],
          rationale: "Duplicate evaluation candidate.",
        },
      ],
    };
  }

  const first = plan.outfits[0]!;
  return {
    ...plan,
    outfits: plan.outfits.map((outfit, index) =>
      index === 1
        ? { ...outfit, garmentIds: [...first.garmentIds] }
        : outfit,
    ),
  };
}

export function overCapsuleLimit(
  wardrobe: PlannerGarment[],
  constraints: NormalizedConstraints,
): CandidatePlan {
  const all = wardrobe
    .filter((garment) => !constraints.excludedGarmentIds.includes(garment.id))
    .map((garment) => garment.id);
  const outfits = [
    {
      id: "look-1",
      occasion: constraints.occasions[0] ?? "Everyday",
      garmentIds: all.slice(0, Math.max(1, Math.min(3, all.length))),
      rationale: "Uses more unique pieces than the capsule allows.",
    },
  ];

  return {
    mode: "capsule",
    capsuleGarmentIds: all,
    outfits,
  };
}
