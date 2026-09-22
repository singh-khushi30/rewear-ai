import { Router } from "express";
import { sendError, userSafeMessages } from "../lib/http.js";
import {
  describeGeminiFailure,
  formatGeminiFailureLog,
} from "../lib/analysis/gemini-error.js";
import { getGeminiModel } from "../lib/gemini.js";
import { requireAuth, type VerifyAccessToken } from "../middleware/require-auth.js";
import { logPlanningEvent } from "../planning/log.js";
import { PlanningUnavailableError } from "../planning/llm.js";
import { runPlanning as defaultRunPlanning, type RunPlanning } from "../planning/run.js";
import {
  PlanningParseError,
  planningRequestSchema,
} from "../planning/schemas.js";
import type { CandidatePlan, NormalizedConstraints } from "../planning/types.js";
import {
  loadPlannerWardrobe as defaultLoadWardrobe,
  WardrobeUnavailableError,
  type LoadPlannerWardrobe,
} from "../planning/wardrobe.js";

export function createPlansRouter(options?: {
  verifyAccessToken?: VerifyAccessToken;
  loadPlannerWardrobe?: LoadPlannerWardrobe;
  runPlanning?: RunPlanning;
}) {
  const router = Router();
  const loadWardrobe = options?.loadPlannerWardrobe ?? defaultLoadWardrobe;
  const runPlanning = options?.runPlanning ?? defaultRunPlanning;

  router.post(
    "/generate",
    requireAuth(options?.verifyAccessToken),
    async (req, res) => {
      const startedAt = Date.now();
      const requestId = req.requestId;
      const userId = req.user?.id;
      const accessToken = req.accessToken;

      if (!userId || !accessToken) {
        sendError(res, 401, "UNAUTHENTICATED", userSafeMessages.unauthenticated);
        return;
      }

      const parsed = planningRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        logPlanningEvent({
          requestId,
          userId,
          wardrobeSize: 0,
          mode: null,
          result: "invalid_request",
          latencyMs: Date.now() - startedAt,
        });
        sendError(res, 400, "INVALID_REQUEST", userSafeMessages.invalidRequest);
        return;
      }

      let wardrobeSize = 0;
      let mode = parsed.data.mode ?? null;

      try {
        const wardrobe = await loadWardrobe(accessToken);
        wardrobeSize = wardrobe.length;

        if (wardrobe.length === 0) {
          logPlanningEvent({
            requestId,
            userId,
            wardrobeSize,
            mode,
            result: {
              status: "empty_wardrobe",
              plan: null,
              constraints: null,
              validation: null,
              firstPassValid: null,
              repairAttempts: 0,
              finalValid: false,
              violationCodes: [],
              message: userSafeMessages.emptyWardrobe,
            },
            latencyMs: Date.now() - startedAt,
          });

          sendError(res, 422, "EMPTY_WARDROBE", userSafeMessages.emptyWardrobe);
          return;
        }

        const result = await runPlanning({
          request: parsed.data,
          wardrobe,
        });

        mode = result.constraints?.mode ?? mode;
        logPlanningEvent({
          requestId,
          userId,
          wardrobeSize,
          mode,
          result,
          latencyMs: Date.now() - startedAt,
        });

        if (result.status === "empty_wardrobe") {
          sendError(res, 422, "EMPTY_WARDROBE", userSafeMessages.emptyWardrobe);
          return;
        }

        if (!result.finalValid || !result.plan) {
          res.status(422).json({
            success: false,
            error: {
              code: "UNSATISFIED_CONSTRAINTS",
              message: result.message ?? userSafeMessages.unsatisfiedConstraints,
              violationCodes: result.violationCodes,
            },
          });
          return;
        }

        res.status(200).json({
          success: true,
          status: "valid",
          plan: publicPlan(result.plan),
          constraints: publicConstraints(result.constraints),
          meta: {
            lookCount: result.plan.outfits.length,
            piecesUsed: uniquePieceCount(result.plan),
            repaired: result.repairAttempts > 0,
          },
        });
      } catch (error) {
        if (
          error instanceof PlanningUnavailableError ||
          error instanceof WardrobeUnavailableError
        ) {
          logPlanningEvent({
            requestId,
            userId,
            wardrobeSize,
            mode,
            result: "unavailable",
            latencyMs: Date.now() - startedAt,
          });
          sendError(
            res,
            503,
            "PLANNING_UNAVAILABLE",
            userSafeMessages.planningUnavailable,
          );
          return;
        }

        if (error instanceof PlanningParseError) {
          logPlanningEvent({
            requestId,
            userId,
            wardrobeSize,
            mode,
            result: "failed",
            latencyMs: Date.now() - startedAt,
          });
          sendError(res, 502, "PLANNING_FAILED", userSafeMessages.planningFailed);
          return;
        }

        logPlanningEvent({
          requestId,
          userId,
          wardrobeSize,
          mode,
          result: "failed",
          latencyMs: Date.now() - startedAt,
        });

        if (process.env.NODE_ENV !== "production") {
          console.info(
            formatGeminiFailureLog(
              describeGeminiFailure(error),
              getGeminiModel(),
            ).replace("[analyze]", "[plan]"),
          );
        }

        sendError(res, 502, "PLANNING_FAILED", userSafeMessages.planningFailed);
      }
    },
  );

  return router;
}

function uniquePieceCount(plan: CandidatePlan) {
  return new Set([
    ...plan.capsuleGarmentIds,
    ...plan.outfits.flatMap((outfit) => outfit.garmentIds),
  ]).size;
}

function publicPlan(plan: CandidatePlan) {
  return {
    mode: plan.mode,
    capsuleGarmentIds: plan.capsuleGarmentIds,
    outfits: plan.outfits.map((outfit) => ({
      id: outfit.id,
      occasion: outfit.occasion,
      garmentIds: outfit.garmentIds,
      rationale: outfit.rationale,
    })),
  };
}

function publicConstraints(constraints: NormalizedConstraints | null) {
  if (!constraints) {
    return null;
  }

  return {
    mode: constraints.mode,
    outfitCount: constraints.outfitCount,
    maxPieces: constraints.maxPieces,
    occasions: constraints.occasions,
    climate: constraints.climate,
    formality: constraints.formality,
    stylePreference: constraints.stylePreference,
  };
}
