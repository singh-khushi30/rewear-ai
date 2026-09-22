import assert from "node:assert/strict";
import { test } from "node:test";
import {
  classifyGarmentRole,
  composeOutfitSlots,
  slottedGarmentIds,
} from "./garment-role";
import { resolveLookPieces, type WardrobeLookItem } from "./look";

function piece(
  id: string,
  category: string,
  extra: Partial<WardrobeLookItem> = {},
): [string, WardrobeLookItem] {
  return [
    id,
    {
      id,
      category,
      primary_color: "Ivory",
      imageUrl: `https://example.com/${id}.jpg`,
      ...extra,
    },
  ];
}

test("classifies upper-body garments from persisted categories", () => {
  assert.equal(classifyGarmentRole("Camisole"), "upper");
  assert.equal(classifyGarmentRole("t-shirt"), "upper");
  assert.equal(classifyGarmentRole("Blouse"), "upper");
  assert.equal(classifyGarmentRole("Knit"), "upper");
  assert.equal(classifyGarmentRole("knitwear"), "upper");
  assert.equal(classifyGarmentRole("Hoodie"), "upper");
});

test("classifies lower-body garments from persisted categories", () => {
  assert.equal(classifyGarmentRole("Jeans"), "lower");
  assert.equal(classifyGarmentRole("trousers"), "lower");
  assert.equal(classifyGarmentRole("Tiered denim skirt"), "lower");
  assert.equal(classifyGarmentRole("Midi Skirt"), "lower");
  assert.equal(classifyGarmentRole("shorts"), "lower");
});

test("classifies full-body garments", () => {
  assert.equal(classifyGarmentRole("dress"), "full");
  assert.equal(classifyGarmentRole("Slip Dress"), "full");
  assert.equal(classifyGarmentRole("jumpsuit"), "full");
});

test("classifies outerwear", () => {
  assert.equal(classifyGarmentRole("jacket"), "outer");
  assert.equal(classifyGarmentRole("Blazer"), "outer");
  assert.equal(classifyGarmentRole("cardigan"), "outer");
  assert.equal(classifyGarmentRole("Wool Coat"), "outer");
});

test("classifies footwear", () => {
  assert.equal(classifyGarmentRole("sneakers"), "footwear");
  assert.equal(classifyGarmentRole("Loafers"), "footwear");
  assert.equal(classifyGarmentRole("shoes"), "footwear");
  assert.equal(classifyGarmentRole("Ankle boots"), "footwear");
});

test("unknown and residual categories fall back without failing", () => {
  assert.equal(classifyGarmentRole("other"), "other");
  assert.equal(classifyGarmentRole("activewear"), "other");
  assert.equal(classifyGarmentRole("Mystery piece"), "other");
  assert.equal(classifyGarmentRole(""), "other");
});

test("accessories stay off the body stack", () => {
  assert.equal(classifyGarmentRole("bag"), "accessory");
  assert.equal(classifyGarmentRole("Silk scarf"), "accessory");
});

test("top + bottom slots follow planner-selected garments, not array guesswork", () => {
  const garments = new Map([
    piece("skirt-1", "Tiered denim skirt"),
    piece("top-1", "Camisole"),
  ]);
  const selected = ["top-1", "skirt-1"];
  const pieces = resolveLookPieces(selected, garments);
  const slots = composeOutfitSlots(pieces);

  assert.deepEqual(
    pieces.map((item) => item.id),
    selected,
  );
  assert.equal(slots.upper?.id, "top-1");
  assert.equal(slots.lower?.id, "skirt-1");
  assert.equal(slots.full, null);
  assert.deepEqual(slottedGarmentIds(slots).sort(), ["skirt-1", "top-1"]);
});

test("a dress occupies the full-body slot", () => {
  const garments = new Map([piece("dress-1", "Slip Dress")]);
  const pieces = resolveLookPieces(["dress-1"], garments);
  const slots = composeOutfitSlots(pieces);

  assert.equal(slots.full?.id, "dress-1");
  assert.equal(slots.upper, null);
  assert.equal(slots.lower, null);
  assert.equal(slots.standalone, null);
});

test("outerwear layers around a body garment", () => {
  const garments = new Map([
    piece("dress-1", "dress"),
    piece("coat-1", "Wool Coat"),
  ]);
  const slots = composeOutfitSlots(
    resolveLookPieces(["dress-1", "coat-1"], garments),
  );

  assert.equal(slots.full?.id, "dress-1");
  assert.equal(slots.outer?.id, "coat-1");
});

test("unknown categories become a standalone piece when there is no body garment", () => {
  const garments = new Map([piece("odd-1", "Mystery piece")]);
  const slots = composeOutfitSlots(resolveLookPieces(["odd-1"], garments));

  assert.equal(slots.standalone?.id, "odd-1");
  assert.equal(slots.upper, null);
  assert.equal(slots.lower, null);
  assert.equal(slots.full, null);
});

test("extra unknown pieces stay supporting when a body already exists", () => {
  const garments = new Map([
    piece("top-1", "Camisole"),
    piece("skirt-1", "Skirt"),
    piece("odd-1", "Mystery piece"),
  ]);
  const slots = composeOutfitSlots(
    resolveLookPieces(["top-1", "skirt-1", "odd-1"], garments),
  );

  assert.equal(slots.upper?.id, "top-1");
  assert.equal(slots.lower?.id, "skirt-1");
  assert.deepEqual(
    slots.extras.map((item) => item.id),
    ["odd-1"],
  );
});

test("four or more supporting pieces stay limited in the composition", () => {
  const garments = new Map([
    piece("top-1", "Camisole"),
    piece("skirt-1", "Skirt"),
    piece("odd-1", "Mystery one"),
    piece("odd-2", "Mystery two"),
    piece("odd-3", "Mystery three"),
  ]);
  const slots = composeOutfitSlots(
    resolveLookPieces(
      ["top-1", "skirt-1", "odd-1", "odd-2", "odd-3"],
      garments,
    ),
  );

  assert.equal(slots.upper?.id, "top-1");
  assert.equal(slots.lower?.id, "skirt-1");
  assert.deepEqual(
    slots.extras.map((item) => item.id),
    ["odd-1", "odd-2"],
  );
});

test("composition never invents garments beyond the planner selection", () => {
  const garments = new Map([
    piece("top-1", "Camisole"),
    piece("skirt-1", "Skirt"),
    piece("coat-1", "Blazer"),
  ]);
  const selected = ["top-1", "skirt-1"];
  const pieces = resolveLookPieces(selected, garments);
  const slots = composeOutfitSlots(pieces);

  assert.deepEqual(pieces.map((item) => item.id), selected);
  assert.equal(
    slottedGarmentIds(slots).includes("coat-1"),
    false,
  );
});
