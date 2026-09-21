import type { Response } from "express";

export type ApiErrorCode =
  | "UNAUTHENTICATED"
  | "UNSUPPORTED_IMAGE"
  | "IMAGE_TOO_LARGE"
  | "INVALID_IMAGE"
  | "ANALYSIS_FAILED"
  | "ANALYSIS_UNAVAILABLE";

export function sendError(
  res: Response,
  status: number,
  code: ApiErrorCode,
  message: string,
) {
  return res.status(status).json({
    success: false,
    error: { code, message },
  });
}

export function sendAnalysis(res: Response, analysis: unknown) {
  return res.status(200).json({
    success: true,
    analysis,
  });
}

export const userSafeMessages = {
  unauthenticated: "Your session has expired. Sign in again.",
  unsupportedImage: "Use a JPG, PNG or WEBP image.",
  imageTooLarge: "Choose an image under 10 MB.",
  invalidImage: "We couldn’t read this photograph. Try another file.",
  analysisFailed: "We couldn’t analyze this piece. Try another photo.",
  analysisUnavailable: "Analysis is temporarily unavailable. Try again shortly.",
} as const;
