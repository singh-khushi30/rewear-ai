import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createGeminiClient } from "../lib/gemini.js";
import { validatePlan } from "../planning/validator.js";
import { constraintsFromScenario } from "./constraints.js";
import { composeValidPlan } from "./compose.js";
import { judgeScenario } from "./judge.js";
import { aggregateResults } from "./metrics.js";
import { formatEvalReport } from "./report.js";
import { evaluateScenarios } from "./run.js";
import {
  evaluationScenarios,
  listEvaluationScenarios,
} from "./scenarios.js";
import type { ScenarioEvalResult } from "./schema.js";
import { getEvaluationWardrobe } from "./wardrobes.js";

function result(
  overrides: Partial<ScenarioEvalResult> & Pick<ScenarioEvalResult, "scenarioId">,
): ScenarioEvalResult {
  return {
    name: overrides.name ?? overrides.scenarioId,
    category: overrides.category ?? "basic",
    expected: overrides.expected ?? "valid",
    firstPassValid: overrides.firstPassValid ?? true,
    repairAttempts: overrides.repairAttempts ?? 0,
    finalValid: overrides.finalValid ?? true,
    status: overrides.status ?? "valid",
    violations: overrides.violations ?? [],
    candidatePlans: overrides.candidatePlans ?? 1,
    referencedIds: overrides.referencedIds ?? 3,
    unknownIds: overrides.unknownIds ?? 0,
    hardConstraintsApplicable: overrides.hardConstraintsApplicable ?? 1,
    hardConstraintsSatisfied: overrides.hardConstraintsSatisfied ?? 1,
    outcome: overrides.outcome ?? "PASS",
    reason: overrides.reason ?? "test",
    ...overrides,
  };
}

const previousGeminiKey = process.env.GEMINI_API_KEY;

before(() => {
  delete process.env.GEMINI_API_KEY;
});

after(() => {
  if (previousGeminiKey === undefined) {
    delete process.env.GEMINI_API_KEY;
    return;
  }

  process.env.GEMINI_API_KEY = previousGeminiKey;
});

test("empty evaluation set is safe", () => {
  const aggregate = aggregateResults("deterministic", []);
  assert.equal(aggregate.total, 0);
  assert.equal(aggregate.firstPassValidPercent, 0);
  assert.equal(aggregate.finalValidPercent, 0);
  assert.equal(aggregate.repairRatePercent, 0);
  assert.equal(aggregate.averageRepairAttempts, 0);
  assert.equal(aggregate.unknownGarmentRatePercent, 0);
  assert.equal(aggregate.hardConstraintSatisfactionPercent, 0);
  assert.equal(aggregate.outcomes.PASS, 0);
  assert.equal(aggregate.outcomes.FAIL, 0);
});

test("metrics calculate first-pass, final, repair, and averages from results", () => {
  const aggregate = aggregateResults("deterministic", [
    result({
      scenarioId: "a",
      firstPassValid: true,
      repairAttempts: 0,
      finalValid: true,
    }),
    result({
      scenarioId: "b",
      firstPassValid: false,
      repairAttempts: 1,
      finalValid: true,
    }),
    result({
      scenarioId: "c",
      firstPassValid: false,
      repairAttempts: 2,
      finalValid: false,
      outcome: "FAIL",
    }),
    result({
      scenarioId: "d",
      firstPassValid: null,
      repairAttempts: 0,
      finalValid: false,
      outcome: "PASS",
      expected: "unsatisfiable",
    }),
  ]);

  assert.equal(aggregate.total, 4);
  assert.equal(aggregate.firstPassValidPercent, 33.3);
  assert.equal(aggregate.finalValidPercent, 50);
  assert.equal(aggregate.repairRatePercent, 50);
  assert.equal(aggregate.averageRepairAttempts, 0.8);
});

test("violation aggregation counts unique codes per scenario", () => {
  const aggregate = aggregateResults("deterministic", [
    result({
      scenarioId: "a",
      violations: ["UNKNOWN_GARMENT", "DUPLICATE_OUTFIT"],
    }),
    result({
      scenarioId: "b",
      violations: ["UNKNOWN_GARMENT"],
    }),
    result({
      scenarioId: "c",
      violations: [],
    }),
  ]);

  assert.equal(aggregate.violationCounts.UNKNOWN_GARMENT, 2);
  assert.equal(aggregate.violationCounts.DUPLICATE_OUTFIT, 1);
  assert.equal(aggregate.violationCounts.EMPTY_OUTFIT, 0);
});

test("unknown garment rate uses referenced IDs as the denominator", () => {
  const aggregate = aggregateResults("deterministic", [
    result({
      scenarioId: "a",
      referencedIds: 8,
      unknownIds: 2,
    }),
    result({
      scenarioId: "b",
      referencedIds: 2,
      unknownIds: 0,
    }),
  ]);

  assert.equal(aggregate.unknownGarmentRatePercent, 20);
});

test("expected-unsatisfiable PASS and FAIL are counted separately", () => {
  const aggregate = aggregateResults("deterministic", [
    result({
      scenarioId: "ok",
      expected: "unsatisfiable",
      finalValid: false,
      outcome: "PASS",
    }),
    result({
      scenarioId: "bad",
      expected: "unsatisfiable",
      finalValid: true,
      outcome: "FAIL",
    }),
    result({
      scenarioId: "valid-ok",
      expected: "valid",
      outcome: "PASS",
    }),
  ]);

  assert.equal(aggregate.expectedUnsatisfiable, 2);
  assert.equal(aggregate.passedExpectedUnsatisfiable, 1);
  assert.equal(aggregate.failedExpectedUnsatisfiable, 1);
  assert.equal(aggregate.passedExpectedValid, 1);
});

test("failed expected-valid scenarios increment FAIL", () => {
  const aggregate = aggregateResults("deterministic", [
    result({
      scenarioId: "miss",
      expected: "valid",
      finalValid: false,
      outcome: "FAIL",
    }),
  ]);

  assert.equal(aggregate.failedExpectedValid, 1);
  assert.equal(aggregate.outcomes.FAIL, 1);
  assert.equal(aggregate.finalValidPercent, 0);
});

test("judge passes expected-valid only when the run is finally valid", () => {
  const scenario = evaluationScenarios.find((item) => item.id === "basic-001")!;
  const wardrobe = getEvaluationWardrobe(scenario.wardrobeId);
  const plan = composeValidPlan(
    wardrobe,
    constraintsFromScenario(scenario.request, scenario.expectedConstraints, wardrobe),
  );

  const pass = judgeScenario({
    scenario,
    wardrobe,
    candidates: [plan],
    run: {
      status: "valid",
      plan,
      constraints: constraintsFromScenario(
        scenario.request,
        scenario.expectedConstraints,
        wardrobe,
      ),
      validation: { valid: true, violations: [] },
      firstPassValid: true,
      repairAttempts: 0,
      finalValid: true,
      violationCodes: [],
      message: null,
    },
  });
  assert.equal(pass.outcome, "PASS");

  const fail = judgeScenario({
    scenario,
    wardrobe,
    candidates: [],
    run: {
      status: "unsatisfied",
      plan: null,
      constraints: null,
      validation: null,
      firstPassValid: false,
      repairAttempts: 2,
      finalValid: false,
      violationCodes: ["EMPTY_OUTFIT"],
      message: "Could not satisfy the request.",
    },
  });
  assert.equal(fail.outcome, "FAIL");
});

test("judge passes expected-unsatisfiable only for controlled grounded refusal", () => {
  const scenario = evaluationScenarios.find(
    (item) => item.id === "insufficient-001",
  )!;
  const wardrobe = getEvaluationWardrobe(scenario.wardrobeId);

  const pass = judgeScenario({
    scenario,
    wardrobe,
    candidates: [],
    run: {
      status: "unsatisfied",
      plan: null,
      constraints: null,
      validation: {
        valid: false,
        violations: [
          {
            code: "OUTFIT_COUNT_MISMATCH",
            message: "Too many outfits.",
          },
        ],
      },
      firstPassValid: false,
      repairAttempts: 2,
      finalValid: false,
      violationCodes: ["OUTFIT_COUNT_MISMATCH"],
      message: "Could not satisfy the request.",
    },
  });
  assert.equal(pass.outcome, "PASS");

  const leaked = judgeScenario({
    scenario,
    wardrobe,
    candidates: [
      {
        mode: "outfit",
        capsuleGarmentIds: [],
        outfits: [
          {
            id: "look-1",
            occasion: "Everyday",
            garmentIds: ["ghost-coat-99"],
            rationale: "Hallucinated.",
          },
        ],
      },
    ],
    run: {
      status: "unsatisfied",
      plan: null,
      constraints: null,
      validation: null,
      firstPassValid: false,
      repairAttempts: 2,
      finalValid: false,
      violationCodes: ["UNKNOWN_GARMENT"],
      message: "Could not satisfy the request.",
    },
  });
  assert.equal(leaked.outcome, "FAIL");
});

test("scripted valid plans pass the production validator", () => {
  for (const scenario of evaluationScenarios.filter(
    (item) => item.expected === "valid",
  )) {
    const wardrobe = getEvaluationWardrobe(scenario.wardrobeId);
    const constraints = constraintsFromScenario(
      scenario.request,
      scenario.expectedConstraints,
      wardrobe,
    );
    const plan = composeValidPlan(wardrobe, constraints);
    const validation = validatePlan(constraints, wardrobe, plan);
    assert.equal(
      validation.valid,
      true,
      `${scenario.id}: ${validation.violations.map((item) => item.code).join(",")}`,
    );
  }
});

test("deterministic evaluation requires zero Gemini calls", async () => {
  assert.equal(createGeminiClient(), null);

  const report = await evaluateScenarios({ live: false });

  assert.equal(report.mode, "deterministic");
  assert.equal(report.model, null);
  assert.equal(createGeminiClient(), null);
  assert.equal(
    report.results.every((item) => item.status !== "error"),
    true,
  );
  assert.equal(report.aggregate.outcomes.FAIL, 0);
  assert.equal(report.aggregate.total, evaluationScenarios.length);
});

test("scenario catalog covers distinct categories and fixtures", () => {
  const categories = new Set(evaluationScenarios.map((item) => item.category));
  const wardrobes = new Set(evaluationScenarios.map((item) => item.wardrobeId));
  assert.equal(evaluationScenarios.length >= 30, true);
  assert.equal(evaluationScenarios.length <= 40, true);
  assert.equal(categories.size, 8);
  assert.equal(wardrobes.size >= 6, true);
  assert.deepEqual(
    listEvaluationScenarios(2).map((item) => item.id),
    evaluationScenarios.slice(0, 2).map((item) => item.id),
  );
});

test("report text uses calculated aggregates", () => {
  const report = formatEvalReport({
    generatedAt: "2026-09-24T00:00:00.000Z",
    mode: "deterministic",
    model: null,
    results: [
      result({
        scenarioId: "basic-001",
        firstPassValid: true,
        finalValid: true,
        outcome: "PASS",
      }),
    ],
    aggregate: aggregateResults("deterministic", [
      result({
        scenarioId: "basic-001",
        firstPassValid: true,
        finalValid: true,
        outcome: "PASS",
      }),
    ]),
  });

  assert.match(report, /Scenarios\s+1/);
  assert.match(report, /Final valid\s+100\.0%/);
  assert.doesNotMatch(report, /92%/);
});
