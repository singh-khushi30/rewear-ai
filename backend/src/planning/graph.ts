import { END, START, StateGraph } from "@langchain/langgraph";
import { missingRequiredFromRequest } from "./constraints.js";
import { extractConstraints, type ExtractConstraints } from "./extract.js";
import {
  emptyWardrobeMessage,
  unsatisfiedMessage,
  userSafeViolationCodes,
} from "./messages.js";
import { buildCandidatePlan, type BuildCandidatePlan } from "./planner.js";
import { repairCandidatePlan, type RepairCandidatePlan } from "./repair.js";
import { PlanningParseError } from "./schemas.js";
import { PlanningAnnotation, type PlanningState } from "./state.js";
import { MAX_REPAIR_ATTEMPTS, type PlanningRunResult } from "./types.js";
import { validatePlan } from "./validator.js";

export type PlanningGraphNodes = {
  extractConstraints?: ExtractConstraints;
  buildCandidatePlan?: BuildCandidatePlan;
  repairCandidatePlan?: RepairCandidatePlan;
};

function emptyPlan() {
  return {
    mode: "outfit" as const,
    capsuleGarmentIds: [],
    outfits: [],
  };
}

export function createPlanningGraph(nodes: PlanningGraphNodes = {}) {
  const extract = nodes.extractConstraints ?? extractConstraints;
  const plan = nodes.buildCandidatePlan ?? buildCandidatePlan;
  const repair = nodes.repairCandidatePlan ?? repairCandidatePlan;

  const graph = new StateGraph(PlanningAnnotation)
    .addNode("extract", async (state: PlanningState) => {
      const missing = missingRequiredFromRequest(state.request, state.wardrobe);
      if (missing.length > 0) {
        const constraints = {
          mode: state.request.mode ?? "outfit",
          outfitCount: state.request.outfitCount ?? null,
          maxPieces: state.request.maxPieces ?? null,
          occasions: state.request.occasions ?? [],
          climate: state.request.climate ?? null,
          formality: state.request.formality ?? null,
          stylePreference: state.request.stylePreference ?? null,
          requiredGarmentIds: state.request.requiredGarmentIds ?? [],
          excludedGarmentIds: state.request.excludedGarmentIds ?? [],
          avoidRepeatOutfits: state.request.avoidRepeatOutfits ?? true,
          hardConstraints: ["required garments"],
          softPreferences: [],
        };

        return {
          constraints,
          candidatePlan: emptyPlan(),
          validation: {
            valid: false,
            violations: missing.map((garmentId) => ({
              code: "REQUIRED_GARMENT_MISSING" as const,
              message: "A required garment is missing from the plan.",
              details: { garmentId },
            })),
          },
          firstPassValid: false,
          status: "unsatisfied" as const,
          message: unsatisfiedMessage(constraints, state.wardrobe, {
            valid: false,
            violations: [
              {
                code: "REQUIRED_GARMENT_MISSING",
                message: "A required garment is missing from the plan.",
                details: { garmentId: missing[0] },
              },
            ],
          }),
        };
      }

      const constraints = await extract({
        request: state.request,
        wardrobe: state.wardrobe,
      });

      return { constraints };
    })
    .addNode("plan", async (state: PlanningState) => {
      if (!state.constraints || state.status === "unsatisfied") {
        return {};
      }

      try {
        const candidatePlan = await plan({
          request: state.request.request,
          constraints: state.constraints,
          wardrobe: state.wardrobe,
        });

        return { candidatePlan };
      } catch (error) {
        if (error instanceof PlanningParseError) {
          return { candidatePlan: emptyPlan() };
        }

        throw error;
      }
    })
    .addNode("validate", (state: PlanningState) => {
      if (state.status === "unsatisfied" && state.validation) {
        return {};
      }

      if (!state.constraints || !state.candidatePlan) {
        const validation = {
          valid: false,
          violations: [
            {
              code: "EMPTY_OUTFIT" as const,
              message: "An outfit contains no garments.",
            },
          ],
        };

        return {
          validation,
          firstPassValid: state.firstPassValid ?? false,
          status:
            state.repairAttempts >= MAX_REPAIR_ATTEMPTS
              ? ("unsatisfied" as const)
              : ("running" as const),
        };
      }

      const validation = validatePlan(
        state.constraints,
        state.wardrobe,
        state.candidatePlan,
      );

      return {
        validation,
        firstPassValid: state.firstPassValid ?? validation.valid,
        status: validation.valid
          ? ("valid" as const)
          : state.repairAttempts >= MAX_REPAIR_ATTEMPTS
            ? ("unsatisfied" as const)
            : ("running" as const),
      };
    })
    .addNode("repair", async (state: PlanningState) => {
      if (!state.constraints || !state.candidatePlan || !state.validation) {
        return { repairAttempts: state.repairAttempts + 1 };
      }

      try {
        const candidatePlan = await repair({
          request: state.request.request,
          constraints: state.constraints,
          wardrobe: state.wardrobe,
          previousPlan: state.candidatePlan,
          validation: state.validation,
        });

        return {
          candidatePlan,
          repairAttempts: state.repairAttempts + 1,
        };
      } catch (error) {
        if (error instanceof PlanningParseError) {
          return { repairAttempts: state.repairAttempts + 1 };
        }

        throw error;
      }
    })
    .addNode("finalize", (state: PlanningState) => {
      if (state.status === "valid" && state.validation?.valid) {
        return {
          status: "valid" as const,
          message: null,
        };
      }

      return {
        status: "unsatisfied" as const,
        candidatePlan: null,
        message: unsatisfiedMessage(
          state.constraints,
          state.wardrobe,
          state.validation,
        ),
      };
    })
    .addEdge(START, "extract")
    .addConditionalEdges("extract", (state: PlanningState) =>
      state.status === "unsatisfied" ? "finalize" : "plan",
    )
    .addEdge("plan", "validate")
    .addConditionalEdges("validate", (state: PlanningState) => {
      if (state.status === "valid" || state.status === "unsatisfied") {
        return "finalize";
      }

      return "repair";
    })
    .addEdge("repair", "validate")
    .addEdge("finalize", END);

  return graph.compile();
}

export type CompiledPlanningGraph = ReturnType<typeof createPlanningGraph>;

export function toPlanningRunResult(
  state: PlanningState,
): PlanningRunResult {
  const validation = state.validation;
  const finalValid = state.status === "valid" && Boolean(validation?.valid);

  return {
    status: finalValid ? "valid" : state.status === "empty_wardrobe"
      ? "empty_wardrobe"
      : "unsatisfied",
    plan: finalValid ? state.candidatePlan : null,
    constraints: state.constraints,
    validation: validation,
    firstPassValid: state.firstPassValid,
    repairAttempts: state.repairAttempts,
    finalValid,
    violationCodes: userSafeViolationCodes(validation),
    message: finalValid ? null : state.message,
  };
}

export async function invokePlanningGraph(
  graph: CompiledPlanningGraph,
  input: {
    request: PlanningState["request"];
    wardrobe: PlanningState["wardrobe"];
  },
): Promise<PlanningRunResult> {
  if (input.wardrobe.length === 0) {
    return {
      status: "empty_wardrobe",
      plan: null,
      constraints: null,
      validation: null,
      firstPassValid: null,
      repairAttempts: 0,
      finalValid: false,
      violationCodes: [],
      message: emptyWardrobeMessage(),
    };
  }

  const state = await graph.invoke({
    request: input.request,
    wardrobe: input.wardrobe,
  });

  return toPlanningRunResult(state);
}
