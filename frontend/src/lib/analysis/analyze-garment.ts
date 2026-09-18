/**
 * Public analysis entry point.
 *
 * Today this is the temporary demo adapter. Later, swap the implementation
 * for the Express / Gemini client without changing the wardrobe UI.
 */
export { demoAnalyzeGarment as analyzeGarment } from "@/lib/analysis/demo-analyze-garment";
export { demoAnalysisStages } from "@/lib/analysis/demo-analyze-garment";
export type {
  AnalyzeGarment,
  AnalyzeGarmentInput,
  AnalyzeGarmentOptions,
  AnalysisProgress,
} from "@/lib/analysis/types";
