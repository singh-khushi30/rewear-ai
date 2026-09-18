import { demoGarmentAnalysis } from "@/lib/analysis/demo-garment";
import type {
  AnalyzeGarment,
  AnalysisProgress,
} from "@/lib/analysis/types";

export const demoAnalysisStages = [
  { id: "read", label: "Reading the garment" },
  { id: "color", label: "Understanding color & material" },
  { id: "form", label: "Estimating silhouette & formality" },
  { id: "profile", label: "Preparing your wardrobe profile" },
] as const;

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
}

function wait(ms: number, signal?: AbortSignal) {
  throwIfAborted(signal);

  if (ms <= 0) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      window.clearTimeout(timeoutId);
      reject(new DOMException("Aborted", "AbortError"));
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/**
 * Temporary client-side stand-in for:
 * image → storage → Express → Gemini Vision → GarmentAnalysis
 *
 * Do not call this from UI components directly. Use `analyzeGarment`.
 */
export const demoAnalyzeGarment: AnalyzeGarment = async (
  _input,
  options = {},
) => {
  const total = demoAnalysisStages.length;
  const stepDelayMs = options.stepDelayMs ?? 1400;

  for (const [index, stage] of demoAnalysisStages.entries()) {
    const progress: AnalysisProgress = {
      id: stage.id,
      label: stage.label,
      index,
      total,
    };
    options.onProgress?.(progress);
    await wait(stepDelayMs, options.signal);
  }

  return { ...demoGarmentAnalysis };
};
