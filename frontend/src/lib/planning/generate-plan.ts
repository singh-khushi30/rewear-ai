import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getApiUrl } from "@/lib/api";
import {
  PlanningError,
  planningErrorMessage,
  type PlanningErrorCode,
} from "@/lib/planning/errors";
import { planningStages } from "@/lib/planning/stages";
import type {
  PlanningProgress,
  PlanningSuccess,
} from "@/lib/planning/types";

type PlanningResponse =
  | PlanningSuccess
  | {
      success: false;
      error: {
        code?: string;
        message?: string;
        violationCodes?: string[];
      };
    };

const statusIntervalMs = 1600;

export const examplePrompts = [
  "Give me 3 smart casual work outfits.",
  "Build a 6-piece weekend capsule.",
  "Style my black trousers three different ways.",
  "4-day trip, maximum 8 pieces, with one work dinner.",
] as const;

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
}

function startStatusRotation(
  onProgress?: (progress: PlanningProgress) => void,
) {
  const total = planningStages.length;
  let index = 0;

  const emit = () => {
    const stage = planningStages[index];
    if (!stage) {
      return;
    }

    onProgress?.({
      id: stage.id,
      label: stage.label,
      index,
      total,
    });
  };

  emit();

  const intervalId = globalThis.setInterval(() => {
    if (index < total - 1) {
      index += 1;
      emit();
    }
  }, statusIntervalMs);

  return () => {
    globalThis.clearInterval(intervalId);
  };
}

async function getAccessToken() {
  const supabase = createBrowserSupabaseClient();
  if (!supabase) {
    throw new PlanningError(
      planningErrorMessage("PLANNING_UNAVAILABLE"),
      "PLANNING_UNAVAILABLE",
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new PlanningError(
      planningErrorMessage("UNAUTHENTICATED"),
      "UNAUTHENTICATED",
    );
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const accessToken = session?.access_token;
  if (!accessToken) {
    throw new PlanningError(
      planningErrorMessage("UNAUTHENTICATED"),
      "UNAUTHENTICATED",
    );
  }

  return accessToken;
}

function errorCodeFromResponse(
  status: number,
  code: string | undefined,
): PlanningErrorCode {
  if (
    code === "UNAUTHENTICATED" ||
    code === "INVALID_REQUEST" ||
    code === "EMPTY_WARDROBE" ||
    code === "UNSATISFIED_CONSTRAINTS" ||
    code === "PLANNING_FAILED" ||
    code === "PLANNING_UNAVAILABLE"
  ) {
    return code;
  }

  if (status === 401) {
    return "UNAUTHENTICATED";
  }

  if (status === 503) {
    return "PLANNING_UNAVAILABLE";
  }

  return "PLANNING_FAILED";
}

export async function generatePlan(
  request: string,
  options: {
    signal?: AbortSignal;
    onProgress?: (progress: PlanningProgress) => void;
  } = {},
): Promise<PlanningSuccess> {
  throwIfAborted(options.signal);

  const stopStatus = startStatusRotation(options.onProgress);

  try {
    const accessToken = await getAccessToken();
    throwIfAborted(options.signal);

    let response: Response;
    try {
      response = await fetch(`${getApiUrl()}/api/plans/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ request }),
        signal: options.signal,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }

      throw new PlanningError(planningErrorMessage("NETWORK"), "NETWORK");
    }

    let payload: PlanningResponse | null = null;
    try {
      payload = (await response.json()) as PlanningResponse;
    } catch {
      payload = null;
    }

    if (!response.ok || !payload || payload.success !== true) {
      const code = errorCodeFromResponse(
        response.status,
        payload && payload.success === false ? payload.error.code : undefined,
      );
      const message =
        payload &&
        payload.success === false &&
        typeof payload.error.message === "string" &&
        payload.error.message.trim().length > 0 &&
        code === "UNSATISFIED_CONSTRAINTS"
          ? payload.error.message
          : planningErrorMessage(code);
      const violationCodes =
        payload && payload.success === false
          ? payload.error.violationCodes ?? []
          : [];

      throw new PlanningError(message, code, violationCodes);
    }

    return payload;
  } finally {
    stopStatus();
  }
}
