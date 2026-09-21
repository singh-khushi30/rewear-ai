/**
 * Public analysis entry point.
 *
 * UI → analyzeGarment() → Express → Gemini.
 * Do not import the Gemini SDK from the browser.
 */
export { analyzeGarment } from "@/lib/analysis/api-analyze-garment";
export { analysisStages } from "@/lib/analysis/stages";
export type {
  AnalyzeGarment,
  AnalyzeGarmentInput,
  AnalyzeGarmentOptions,
  AnalysisProgress,
} from "@/lib/analysis/types";
