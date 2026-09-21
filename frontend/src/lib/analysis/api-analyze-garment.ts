import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getApiUrl } from "@/lib/api";
import type { GarmentAnalysis } from "@/types/garment";
import {
  AnalysisError,
  analysisErrorMessage,
  type AnalysisErrorCode,
} from "@/lib/analysis/errors";
import { analysisStages } from "@/lib/analysis/stages";
import type {
  AnalyzeGarment,
  AnalysisProgress,
} from "@/lib/analysis/types";

type AnalyzeResponse =
  | { success: true; analysis: GarmentAnalysis }
  | {
      success: false;
      error: { code?: string; message?: string };
    };

const statusIntervalMs = 1600;

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
}

function startStatusRotation(
  onProgress?: (progress: AnalysisProgress) => void,
) {
  const total = analysisStages.length;
  let index = 0;

  const emit = () => {
    const stage = analysisStages[index];
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
    throw new AnalysisError(
      analysisErrorMessage("ANALYSIS_UNAVAILABLE"),
      "ANALYSIS_UNAVAILABLE",
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new AnalysisError(
      analysisErrorMessage("UNAUTHENTICATED"),
      "UNAUTHENTICATED",
    );
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const accessToken = session?.access_token;
  if (!accessToken) {
    throw new AnalysisError(
      analysisErrorMessage("UNAUTHENTICATED"),
      "UNAUTHENTICATED",
    );
  }

  return accessToken;
}

function errorCodeFromResponse(
  status: number,
  code: string | undefined,
): AnalysisErrorCode {
  if (
    code === "UNAUTHENTICATED" ||
    code === "UNSUPPORTED_IMAGE" ||
    code === "IMAGE_TOO_LARGE" ||
    code === "INVALID_IMAGE" ||
    code === "ANALYSIS_FAILED" ||
    code === "ANALYSIS_UNAVAILABLE"
  ) {
    return code;
  }

  if (status === 401) {
    return "UNAUTHENTICATED";
  }

  if (status === 413) {
    return "IMAGE_TOO_LARGE";
  }

  return "ANALYSIS_FAILED";
}

export const analyzeGarment: AnalyzeGarment = async (input, options = {}) => {
  throwIfAborted(options.signal);

  const stopStatus = startStatusRotation(options.onProgress);

  try {
    const accessToken = await getAccessToken();
    throwIfAborted(options.signal);

    const body = new FormData();
    body.append("image", input.file);

    let response: Response;
    try {
      response = await fetch(`${getApiUrl()}/api/garments/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body,
        signal: options.signal,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }

      throw new AnalysisError(
        analysisErrorMessage("NETWORK"),
        "NETWORK",
      );
    }

    let payload: AnalyzeResponse | null = null;
    try {
      payload = (await response.json()) as AnalyzeResponse;
    } catch {
      payload = null;
    }

    if (!response.ok || !payload || payload.success !== true) {
      const code = errorCodeFromResponse(
        response.status,
        payload && payload.success === false ? payload.error.code : undefined,
      );

      throw new AnalysisError(analysisErrorMessage(code), code);
    }

    return payload.analysis;
  } finally {
    stopStatus();
  }
};
