import { violationCodes, type ViolationCode } from "../planning/types.js";
import type { EvalAggregate, ScenarioEvalResult } from "./schema.js";

function percent(numerator: number, denominator: number) {
  if (denominator === 0) {
    return 0;
  }

  return Math.round((numerator / denominator) * 1000) / 10;
}

export function aggregateResults(
  mode: "deterministic" | "live",
  results: ScenarioEvalResult[],
): EvalAggregate {
  const emptyCounts = Object.fromEntries(
    violationCodes.map((code) => [code, 0]),
  ) as Record<ViolationCode, number>;

  if (results.length === 0) {
    return {
      mode,
      total: 0,
      expectedValid: 0,
      expectedUnsatisfiable: 0,
      firstPassValidPercent: 0,
      finalValidPercent: 0,
      repairRatePercent: 0,
      averageRepairAttempts: 0,
      unknownGarmentRatePercent: 0,
      hardConstraintSatisfactionPercent: 0,
      violationCounts: emptyCounts,
      outcomes: { PASS: 0, FAIL: 0 },
      passedExpectedValid: 0,
      passedExpectedUnsatisfiable: 0,
      failedExpectedValid: 0,
      failedExpectedUnsatisfiable: 0,
    };
  }

  const expectedValid = results.filter((item) => item.expected === "valid");
  const expectedUnsatisfiable = results.filter(
    (item) => item.expected === "unsatisfiable",
  );
  const firstPassKnown = results.filter((item) => item.firstPassValid !== null);
  const referencedIds = results.reduce((sum, item) => sum + item.referencedIds, 0);
  const unknownIds = results.reduce((sum, item) => sum + item.unknownIds, 0);
  const hardApplicable = results.reduce(
    (sum, item) => sum + item.hardConstraintsApplicable,
    0,
  );
  const hardSatisfied = results.reduce(
    (sum, item) => sum + item.hardConstraintsSatisfied,
    0,
  );

  const violationCounts = { ...emptyCounts };
  for (const result of results) {
    for (const code of result.violations) {
      violationCounts[code] += 1;
    }
  }

  return {
    mode,
    total: results.length,
    expectedValid: expectedValid.length,
    expectedUnsatisfiable: expectedUnsatisfiable.length,
    firstPassValidPercent: percent(
      firstPassKnown.filter((item) => item.firstPassValid === true).length,
      firstPassKnown.length,
    ),
    finalValidPercent: percent(
      results.filter((item) => item.finalValid).length,
      results.length,
    ),
    repairRatePercent: percent(
      results.filter((item) => item.repairAttempts > 0).length,
      results.length,
    ),
    averageRepairAttempts:
      Math.round(
        (results.reduce((sum, item) => sum + item.repairAttempts, 0) /
          results.length) *
          10,
      ) / 10,
    unknownGarmentRatePercent: percent(unknownIds, referencedIds),
    hardConstraintSatisfactionPercent: percent(hardSatisfied, hardApplicable),
    violationCounts,
    outcomes: {
      PASS: results.filter((item) => item.outcome === "PASS").length,
      FAIL: results.filter((item) => item.outcome === "FAIL").length,
    },
    passedExpectedValid: expectedValid.filter((item) => item.outcome === "PASS")
      .length,
    passedExpectedUnsatisfiable: expectedUnsatisfiable.filter(
      (item) => item.outcome === "PASS",
    ).length,
    failedExpectedValid: expectedValid.filter((item) => item.outcome === "FAIL")
      .length,
    failedExpectedUnsatisfiable: expectedUnsatisfiable.filter(
      (item) => item.outcome === "FAIL",
    ).length,
  };
}

export const metricDefinitions = {
  firstPassValidPercent:
    "Share of evaluated scenarios whose first candidate passed the production validator, excluding runs with a null first-pass flag.",
  finalValidPercent:
    "Share of evaluated scenarios whose final graph result was a validator-accepted plan. Controlled refusals count as not finally valid.",
  repairRatePercent:
    "Share of evaluated scenarios that entered the repair node at least once.",
  averageRepairAttempts:
    "Mean repairAttempts across all evaluated scenarios, including those that never repaired.",
  unknownGarmentRatePercent:
    "Unknown garment IDs divided by all unique garment IDs referenced in first-pass and repair candidates, summed across scenarios.",
  hardConstraintSatisfactionPercent:
    "Among final-valid plans only: required/excluded/count/limit/grounding checks from the scenario expectations that were satisfied, divided by those that applied.",
} as const;
