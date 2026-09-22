import assert from "node:assert/strict";
import { test } from "node:test";
import {
  capsuleConstraints,
  outfitConstraints,
  validCapsulePlan,
  validOutfitPlan,
  wardrobe,
} from "./fixtures.js";
import { createPlanningGraph, invokePlanningGraph } from "./graph.js";
import { MAX_REPAIR_ATTEMPTS } from "./types.js";
import type { CandidatePlan } from "./types.js";

const request = {
  request: "Give me 2 different outfits using only what I own.",
};

test("valid repaired plan passes after one repair", async () => {
  let planCalls = 0;
  let repairCalls = 0;
  const invalid = validOutfitPlan();
  invalid.outfits[0]!.garmentIds = ["top-1", "ghost-coat"];

  const graph = createPlanningGraph({
    extractConstraints: async () => outfitConstraints(),
    buildCandidatePlan: async () => {
      planCalls += 1;
      return invalid;
    },
    repairCandidatePlan: async () => {
      repairCalls += 1;
      return validOutfitPlan();
    },
  });

  const result = await invokePlanningGraph(graph, {
    request,
    wardrobe,
  });

  assert.equal(planCalls, 1);
  assert.equal(repairCalls, 1);
  assert.equal(result.firstPassValid, false);
  assert.equal(result.repairAttempts, 1);
  assert.equal(result.finalValid, true);
  assert.equal(result.status, "valid");
  assert.deepEqual(result.plan, validOutfitPlan());
  assert.deepEqual(result.violationCodes, []);
});

test("graph stops after max repair attempts", async () => {
  let repairCalls = 0;
  const invalid: CandidatePlan = {
    mode: "outfit",
    capsuleGarmentIds: [],
    outfits: [
      {
        id: "look-1",
        occasion: "Work",
        garmentIds: ["missing-1"],
        rationale: "Invalid on purpose.",
      },
    ],
  };

  const graph = createPlanningGraph({
    extractConstraints: async () => outfitConstraints({ outfitCount: 2 }),
    buildCandidatePlan: async () => invalid,
    repairCandidatePlan: async () => {
      repairCalls += 1;
      return invalid;
    },
  });

  const result = await invokePlanningGraph(graph, {
    request,
    wardrobe,
  });

  assert.equal(repairCalls, MAX_REPAIR_ATTEMPTS);
  assert.equal(result.repairAttempts, MAX_REPAIR_ATTEMPTS);
  assert.equal(result.firstPassValid, false);
  assert.equal(result.finalValid, false);
  assert.equal(result.status, "unsatisfied");
  assert.equal(result.plan, null);
  assert.ok(result.violationCodes.includes("UNKNOWN_GARMENT"));
});

test("invalid plan is never returned as success", async () => {
  const graph = createPlanningGraph({
    extractConstraints: async () => capsuleConstraints({ maxPieces: 3 }),
    buildCandidatePlan: async () => validCapsulePlan(),
    repairCandidatePlan: async () => validCapsulePlan(),
  });

  const result = await invokePlanningGraph(graph, {
    request: { request: "Weekend capsule, maximum 3 pieces." },
    wardrobe,
  });

  assert.equal(result.finalValid, false);
  assert.equal(result.status, "unsatisfied");
  assert.equal(result.plan, null);
  assert.ok(result.violationCodes.includes("CAPSULE_LIMIT_EXCEEDED"));
  assert.match(result.message ?? "", /3 pieces/i);
});

test("empty wardrobe is handled without calling planner nodes", async () => {
  let extractCalls = 0;
  let planCalls = 0;

  const graph = createPlanningGraph({
    extractConstraints: async () => {
      extractCalls += 1;
      return outfitConstraints();
    },
    buildCandidatePlan: async () => {
      planCalls += 1;
      return validOutfitPlan();
    },
  });

  const result = await invokePlanningGraph(graph, {
    request,
    wardrobe: [],
  });

  assert.equal(extractCalls, 0);
  assert.equal(planCalls, 0);
  assert.equal(result.status, "empty_wardrobe");
  assert.equal(result.finalValid, false);
  assert.equal(result.plan, null);
  assert.match(result.message ?? "", /wardrobe/i);
});
