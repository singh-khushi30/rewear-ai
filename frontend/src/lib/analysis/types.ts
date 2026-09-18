import type { GarmentAnalysis } from "@/types/garment";

export type AnalyzeGarmentInput = {
  file: File;
};

export type AnalysisProgress = {
  id: string;
  label: string;
  index: number;
  total: number;
};

export type AnalyzeGarmentOptions = {
  onProgress?: (progress: AnalysisProgress) => void;
  signal?: AbortSignal;
  stepDelayMs?: number;
};

export type AnalyzeGarment = (
  input: AnalyzeGarmentInput,
  options?: AnalyzeGarmentOptions,
) => Promise<GarmentAnalysis>;
