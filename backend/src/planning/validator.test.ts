import assert from "node:assert/strict";
import { test } from "node:test";
import {
  capsuleConstraints,
  outfitConstraints,
  validCapsulePlan,
  validOutfitPlan,
  wardrobe,
} from "./fixtures.js";
import { validatePlan } from "./validator.js";

test("valid grounded outfit passes", () => {
  const result = validatePlan(
    outfitConstraints(),
    wardrobe,
    validOutfitPlan(),
  );

  assert.equal(result.valid, true);
  assert.deepEqual(result.violations, []);
});

test("unknown garment fails", () => {
  const plan = validOutfitPlan();
  plan.outfits[0]!.garmentIds = ["top-1", "invented-coat"];

  const result = validatePlan(outfitConstraints(), wardrobe, plan);

  assert.equal(result.valid, false);
  assert.equal(result.violations[0]?.code, "UNKNOWN_GARMENT");
  assert.equal(result.violations[0]?.details?.garmentId, "invented-coat");
});

test("excluded garment fails", () => {
  const result = validatePlan(
    outfitConstraints({ excludedGarmentIds: ["outer-1"] }),
    wardrobe,
    validOutfitPlan(),
  );

  assert.equal(result.valid, false);
  assert.equal(result.violations[0]?.code, "EXCLUDED_GARMENT_USED");
  assert.equal(result.violations[0]?.details?.garmentId, "outer-1");
});

test("missing required garment fails", () => {
  const result = validatePlan(
    outfitConstraints({ requiredGarmentIds: ["bottom-2"] }),
    wardrobe,
    validOutfitPlan(),
  );

  assert.equal(result.valid, false);
  assert.equal(result.violations[0]?.code, "REQUIRED_GARMENT_MISSING");
  assert.equal(result.violations[0]?.details?.garmentId, "bottom-2");
});

test("capsule under limit passes", () => {
  const result = validatePlan(
    capsuleConstraints({ maxPieces: 4 }),
    wardrobe,
    validCapsulePlan(),
  );

  assert.equal(result.valid, true);
});

test("capsule over limit fails", () => {
  const plan = validCapsulePlan();
  plan.capsuleGarmentIds = [
    "top-1",
    "top-2",
    "bottom-1",
    "bottom-2",
    "shoe-1",
  ];
  plan.outfits[0]!.garmentIds = ["top-2", "bottom-2", "shoe-1"];

  const result = validatePlan(capsuleConstraints({ maxPieces: 4 }), wardrobe, plan);

  assert.equal(result.valid, false);
  assert.equal(
    result.violations.some((item) => item.code === "CAPSULE_LIMIT_EXCEEDED"),
    true,
  );
  assert.equal(
    result.violations.find((item) => item.code === "CAPSULE_LIMIT_EXCEEDED")
      ?.details?.actual,
    5,
  );
});

test("outfit count mismatch fails", () => {
  const plan = validOutfitPlan();
  plan.outfits = [plan.outfits[0]!];

  const result = validatePlan(outfitConstraints({ outfitCount: 2 }), wardrobe, plan);

  assert.equal(result.valid, false);
  assert.equal(result.violations[0]?.code, "OUTFIT_COUNT_MISMATCH");
});

test("empty outfit fails", () => {
  const plan = validOutfitPlan();
  plan.outfits[1]!.garmentIds = [];

  const result = validatePlan(outfitConstraints(), wardrobe, plan);

  assert.equal(result.valid, false);
  assert.equal(
    result.violations.some((item) => item.code === "EMPTY_OUTFIT"),
    true,
  );
});

test("duplicate garment inside outfit fails", () => {
  const plan = validOutfitPlan();
  plan.outfits[0]!.garmentIds = ["top-1", "top-1", "bottom-1"];

  const result = validatePlan(outfitConstraints(), wardrobe, plan);

  assert.equal(result.valid, false);
  assert.equal(result.violations[0]?.code, "DUPLICATE_GARMENT_IN_OUTFIT");
});

test("duplicate outfits fail", () => {
  const plan = validOutfitPlan();
  plan.outfits[1]!.garmentIds = ["shoe-1", "bottom-1", "top-1"];

  const result = validatePlan(outfitConstraints(), wardrobe, plan);

  assert.equal(result.valid, false);
  assert.equal(result.violations[0]?.code, "DUPLICATE_OUTFIT");
});

test("outfit using piece outside capsule fails", () => {
  const plan = validCapsulePlan();
  plan.outfits[1]!.garmentIds = ["top-1", "bottom-1", "outer-1"];

  const result = validatePlan(
    capsuleConstraints({ maxPieces: 8 }),
    wardrobe,
    plan,
  );

  assert.equal(result.valid, false);
  assert.equal(result.violations[0]?.code, "OUTFIT_OUTSIDE_CAPSULE");
});
