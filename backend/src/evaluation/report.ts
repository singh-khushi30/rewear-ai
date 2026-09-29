import { violationCodes } from "../planning/types.js";
import { metricDefinitions } from "./metrics.js";
import type { EvalReport } from "./schema.js";

function line(label: string, value: string | number) {
  return `${label.padEnd(24)} ${value}`;
}

export function formatEvalReport(report: EvalReport) {
  const { aggregate } = report;
  const lines = [
    "REWEAR AGENT EVALUATION",
    line("Mode", aggregate.mode),
    line("Model", report.model ?? "none"),
    line("Scenarios", aggregate.total),
    line("Expected valid", aggregate.expectedValid),
    line("Expected unsatisfiable", aggregate.expectedUnsatisfiable),
    line("First-pass valid", `${aggregate.firstPassValidPercent.toFixed(1)}%`),
    line("Final valid", `${aggregate.finalValidPercent.toFixed(1)}%`),
    line("Repair rate", `${aggregate.repairRatePercent.toFixed(1)}%`),
    line("Avg repair attempts", aggregate.averageRepairAttempts.toFixed(1)),
    line("Unknown garment rate", `${aggregate.unknownGarmentRatePercent.toFixed(1)}%`),
    line(
      "Hard constraints",
      `${aggregate.hardConstraintSatisfactionPercent.toFixed(1)}%`,
    ),
    "VIOLATIONS",
    ...violationCodes.map((code) =>
      line(code, aggregate.violationCounts[code]),
    ),
    "OUTCOMES",
    line("PASS", aggregate.outcomes.PASS),
    line("FAIL", aggregate.outcomes.FAIL),
    line("PASS expected valid", aggregate.passedExpectedValid),
    line("PASS expected unsat.", aggregate.passedExpectedUnsatisfiable),
    line("FAIL expected valid", aggregate.failedExpectedValid),
    line("FAIL expected unsat.", aggregate.failedExpectedUnsatisfiable),
  ];

  const failures = report.results.filter((result) => result.outcome === "FAIL");
  if (failures.length > 0) {
    lines.push("FAILURES");
    for (const failure of failures) {
      lines.push(
        `${failure.scenarioId} expected=${failure.expected} outcome=${failure.outcome} finalValid=${failure.finalValid} repairs=${failure.repairAttempts} violations=${failure.violations.join(",") || "none"} reason=${failure.reason}`,
      );
    }
  }

  if (aggregate.mode === "deterministic") {
    lines.push(
      "NOTE Deterministic mode uses scripted candidates through the production graph and validator. These percentages are not Gemini quality scores.",
    );
  }

  lines.push(
    `DEFINITIONS unknown garment rate: ${metricDefinitions.unknownGarmentRatePercent}`,
  );

  return lines.join("\n");
}
