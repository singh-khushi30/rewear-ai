import { createRunPlanning } from "../planning/run.js";
import type { ExtractConstraints } from "../planning/extract.js";
import type { BuildCandidatePlan } from "../planning/planner.js";
import type { RepairCandidatePlan } from "../planning/repair.js";
import { getGeminiModel } from "../lib/gemini.js";
import { constraintsFromScenario } from "./constraints.js";
import { judgeScenario } from "./judge.js";
import { aggregateResults } from "./metrics.js";
import { scriptedCandidates } from "./script.js";
import { listEvaluationScenarios } from "./scenarios.js";
import type { CandidatePlan } from "../planning/types.js";
import type { EvalReport, EvaluationScenario } from "./schema.js";
import { getEvaluationWardrobe } from "./wardrobes.js";

export type EvaluateOptions = {
  live?: boolean;
  limit?: number;
};

export function createDeterministicNodes(scenario: EvaluationScenario) {
  const wardrobe = getEvaluationWardrobe(scenario.wardrobeId);
  let repairs = 0;

  const extractConstraints: ExtractConstraints = async ({ request }) =>
    constraintsFromScenario(request, scenario.expectedConstraints, wardrobe);

  const sequence = () =>
    scriptedCandidates(
      scenario.deterministic,
      wardrobe,
      constraintsFromScenario(
        scenario.request,
        scenario.expectedConstraints,
        wardrobe,
      ),
    );

  const buildCandidatePlan: BuildCandidatePlan = async () => sequence()[0]!;

  const repairCandidatePlan: RepairCandidatePlan = async () => {
    const candidates = sequence();
    repairs += 1;
    return candidates[Math.min(repairs, candidates.length - 1)]!;
  };

  return {
    extractConstraints,
    buildCandidatePlan,
    repairCandidatePlan,
  };
}

export async function evaluateScenario(
  scenario: EvaluationScenario,
  options: { live: boolean },
) {
  const wardrobe = getEvaluationWardrobe(scenario.wardrobeId);
  const candidates: CandidatePlan[] = [];

  const scripted = options.live ? null : createDeterministicNodes(scenario);
  const runPlanning = createRunPlanning(
    options.live
      ? {
          buildCandidatePlan: async (input) => {
            const { buildCandidatePlan } = await import("../planning/planner.js");
            const plan = await buildCandidatePlan(input);
            candidates.push(plan);
            return plan;
          },
          repairCandidatePlan: async (input) => {
            const { repairCandidatePlan } = await import("../planning/repair.js");
            const plan = await repairCandidatePlan(input);
            candidates.push(plan);
            return plan;
          },
        }
      : {
          extractConstraints: scripted!.extractConstraints,
          buildCandidatePlan: async (input) => {
            const plan = await scripted!.buildCandidatePlan(input);
            candidates.push(plan);
            return plan;
          },
          repairCandidatePlan: async (input) => {
            const plan = await scripted!.repairCandidatePlan(input);
            candidates.push(plan);
            return plan;
          },
        },
  );

  try {
    const run = await runPlanning({
      request: scenario.request,
      wardrobe,
    });

    return judgeScenario({
      scenario,
      wardrobe,
      run,
      candidates,
    });
  } catch (error) {
    return judgeScenario({
      scenario,
      wardrobe,
      run: {
        status: "unsatisfied",
        plan: null,
        constraints: null,
        validation: null,
        firstPassValid: null,
        repairAttempts: 0,
        finalValid: false,
        violationCodes: [],
        message: null,
      },
      candidates,
      error:
        error instanceof Error
          ? error.name === "PlanningUnavailableError"
            ? "Planning unavailable."
            : "Planning failed."
          : "Planning failed.",
    });
  }
}

export async function evaluateScenarios(options: EvaluateOptions = {}) {
  const live = options.live === true;
  const scenarios = listEvaluationScenarios(options.limit);
  const results = [];

  for (const scenario of scenarios) {
    results.push(await evaluateScenario(scenario, { live }));
  }

  const report: EvalReport = {
    generatedAt: new Date().toISOString(),
    mode: live ? "live" : "deterministic",
    model: live ? getGeminiModel() : null,
    results,
    aggregate: aggregateResults(live ? "live" : "deterministic", results),
  };

  return report;
}
