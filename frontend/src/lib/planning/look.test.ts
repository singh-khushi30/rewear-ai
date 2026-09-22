import assert from "node:assert/strict";
import { test } from "node:test";
import { composeOutfitSlots } from "./garment-role";
import { canonicalOwnedIds, lookLabel, resolveLookPieces } from "./look";

const garments = new Map([
  [
    "top-1",
    {
      id: "top-1",
      category: "Camisole",
      primary_color: "Ivory",
      imageUrl: "https://example.com/top-1.jpg",
    },
  ],
  [
    "skirt-1",
    {
      id: "skirt-1",
      category: "Tiered denim skirt",
      primary_color: "Indigo",
      imageUrl: "https://example.com/skirt-1.jpg",
    },
  ],
]);

test("selected garment IDs resolve only to owned wardrobe pieces", () => {
  const pieces = resolveLookPieces(["top-1", "invented-coat", "skirt-1"], garments);

  assert.deepEqual(
    pieces.map((piece) => ({ id: piece.id, owned: piece.owned, category: piece.category })),
    [
      { id: "top-1", owned: true, category: "Camisole" },
      { id: "invented-coat", owned: false, category: "Unavailable" },
      { id: "skirt-1", owned: true, category: "Tiered denim skirt" },
    ],
  );
  assert.deepEqual(canonicalOwnedIds(pieces), ["top-1", "skirt-1"]);
});

test("look labels stay compact and do not expose UUIDs", () => {
  assert.equal(lookLabel(0), "Look 01");
  assert.doesNotMatch(lookLabel(1), /[0-9a-f-]{36}/i);
});

test("composition receives exactly the planner-selected garments", () => {
  const selected = ["top-1", "skirt-1"];
  const pieces = resolveLookPieces(selected, garments);
  const slots = composeOutfitSlots(pieces);

  assert.deepEqual(
    pieces.map((piece) => piece.id),
    selected,
  );
  assert.equal(slots.upper?.id, "top-1");
  assert.equal(slots.lower?.id, "skirt-1");
  assert.equal(slots.outer, null);
});
