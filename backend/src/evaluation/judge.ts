import { validatePlan } from "../planning/validator.js";
import type {
  CandidatePlan,
  PlannerGarment,
  PlanningRunResult,
  ViolationCode,
} from "../planning/types.js";
import type {
  EvaluationScenario,
  ExpectedConstraints,
  ScenarioEvalResult,
} from "./schema.js";

export function referencedGarmentIds(plan: CandidatePlan) {
  return [
    ...new Set([
      ...plan.capsuleGarmentIds,
      ...plan.outfits.flatMap((outfit) => outfit.garmentIds),
    ]),
  ];
}

export function unknownGarmentIds(
  plan: CandidatePlan,
  wardrobe: PlannerGarment[],
) {
  const known = new Set(wardrobe.map((garment) => garment.id));
  return referencedGarmentIds(plan).filter((id) => !known.has(id));
}

export function collectCandidateStats(
  candidates: CandidatePlan[],
  wardrobe: PlannerGarment[],
) {
  let referencedIds = 0;
  let unknownIds = 0;

  for (const plan of candidates) {
    const referenced = referencedGarmentIds(plan);
    referencedIds += referenced.length;
    unknownIds += referenced.filter(
      (id) => !wardrobe.some((garment) => garment.id === id),
    ).length;
  }

  return { referencedIds, unknownIds };
}

export function violationsFromCandidates(
  candidates: CandidatePlan[],
  wardrobe: PlannerGarment[],
  constraints: PlanningRunResult["constraints"],
) {
  const codes: ViolationCode[] = [];
  if (!constraints) {
    return codes;
  }

  for (const plan of candidates) {
    const result = validatePlan(constraints, wardrobe, plan);
    for (const violation of result.violations) {
      if (!codes.includes(violation.code)) {
        codes.push(violation.code);
      }
    }
  }

  return codes;
}

export function scoreHardConstraints(
  expected: ExpectedConstraints,
  wardrobe: PlannerGarment[],
  plan: CandidatePlan | null,
) {
  if (!plan) {
    return { applicable: 0, satisfied: 0 };
  }

  const used = new Set(referencedGarmentIds(plan));
  const known = new Set(wardrobe.map((garment) => garment.id));
  let applicable = 0;
  let satisfied = 0;

  const required = expected.requiredGarmentIds ?? [];
  for (const id of required) {
    applicable += 1;
    if (used.has(id)) {
      satisfied += 1;
    }
  }

  const excluded = expected.excludedGarmentIds ?? [];
  for (const id of excluded) {
    applicable += 1;
    if (!used.has(id)) {
      satisfied += 1;
    }
  }

  if (expected.outfitCount != null) {
    applicable += 1;
    if (plan.outfits.length === expected.outfitCount) {
      satisfied += 1;
    }
  }

  if (expected.maxPieces != null) {
    applicable += 1;
    if (used.size <= expected.maxPieces) {
      satisfied += 1;
    }
  }

  applicable += 1;
  if ([...used].every((id) => known.has(id))) {
    satisfied += 1;
  }

  return { applicable, satisfied };
}

export function judgeScenario(input: {
  scenario: EvaluationScenario;
  wardrobe: PlannerGarment[];
  run: PlanningRunResult;
  candidates: CandidatePlan[];
  error?: string;
}): ScenarioEvalResult {
  const { scenario, wardrobe, run, candidates, error } = input;
  const candidateViolations = violationsFromCandidates(
    candidates,
    wardrobe,
    run.constraints,
  );
  const stats = collectCandidateStats(candidates, wardrobe);
  const hard = run.finalValid
    ? scoreHardConstraints(scenario.expectedConstraints, wardrobe, run.plan)
    : { applicable: 0, satisfied: 0 };

  const violations = [
    ...new Set([...run.violationCodes, ...candidateViolations]),
  ];

  let outcome: ScenarioEvalResult["outcome"] = "FAIL";
  let reason = error ?? "Unexpected evaluation outcome.";

  if (error) {
    reason = error;
  } else if (scenario.expected === "valid") {
    outcome = run.finalValid ? "PASS" : "FAIL";
    reason = run.finalValid
      ? "Produced a validator-accepted plan."
      : "Expected a valid plan and did not receive one.";
  } else {
    const hallucinated = stats.unknownIds > 0;
    const returnedSuccess = run.finalValid || run.plan !== null;
    const controlled =
      !run.finalValid &&
      run.plan === null &&
      !hallucinated &&
      (run.status === "unsatisfied" || run.status === "empty_wardrobe");

    outcome = controlled ? "PASS" : "FAIL";
    reason = controlled
      ? "Reported controlled unsatisfied constraints without hallucinated IDs."
      : hallucinated
        ? "Unsatisfiable request referenced IDs outside the wardrobe."
        : returnedSuccess
          ? "Returned a successful plan for an unsatisfiable request."
          : "Did not report a controlled unsatisfied result.";
  }

  return {
    scenarioId: scenario.id,
    name: scenario.name,
    category: scenario.category,
    expected: scenario.expected,
    firstPassValid: run.firstPassValid,
    repairAttempts: run.repairAttempts,
    finalValid: run.finalValid,
    status: error ? "error" : run.status,
    violations,
    candidatePlans: candidates.length,
    referencedIds: stats.referencedIds,
    unknownIds: stats.unknownIds,
    hardConstraintsApplicable: hard.applicable,
    hardConstraintsSatisfied: hard.satisfied,
    outcome,
    reason,
  };
}
