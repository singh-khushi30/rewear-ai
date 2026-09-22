import { shortenUserId } from "../lib/request-id.js";
import type { PlanningRunResult } from "./types.js";

export function logPlanningEvent(input: {
  requestId: string;
  userId: string;
  wardrobeSize: number;
  mode: string | null;
  result: PlanningRunResult | "failed" | "unavailable" | "invalid_request";
  latencyMs: number;
}) {
  const run = typeof input.result === "object" ? input.result : null;
  const outcome =
    typeof input.result === "string"
      ? input.result
      : run?.finalValid
        ? "success"
        : run?.status ?? "failed";
  const validation =
    run?.validation == null
      ? "skipped"
      : run.validation.valid
        ? "pass"
        : "fail";
  const codes = run?.violationCodes.join(",") || "none";
  const mode = run?.constraints?.mode ?? input.mode ?? "unknown";

  console.info(
    `[plan] requestId=${input.requestId} user=${shortenUserId(input.userId)} wardrobeSize=${input.wardrobeSize} mode=${mode} validation=${validation} codes=${codes} repairAttempts=${run?.repairAttempts ?? 0} result=${outcome} latencyMs=${input.latencyMs}`,
  );
}
