import type { Response } from "express";

export type ApiErrorCode =
  | "UNAUTHENTICATED"
  | "UNSUPPORTED_IMAGE"
  | "IMAGE_TOO_LARGE"
  | "INVALID_IMAGE"
  | "ANALYSIS_FAILED"
  | "ANALYSIS_UNAVAILABLE"
  | "INVALID_REQUEST"
  | "EMPTY_WARDROBE"
  | "UNSATISFIED_CONSTRAINTS"
  | "PLANNING_FAILED"
  | "PLANNING_UNAVAILABLE"
  | "LOOKS_UNAVAILABLE"
  | "LOOK_NOT_FOUND"
  | "FOREIGN_GARMENT";

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
  invalidRequest: "Tell REWEAR what you need in a short request.",
  emptyWardrobe:
    "Add a few pieces to your wardrobe first. REWEAR can only plan with what you already own.",
  unsatisfiedConstraints:
    "I couldn’t satisfy every constraint with the pieces you own.",
  planningFailed: "We couldn’t finish this plan. Try again shortly.",
  planningUnavailable: "Planning is temporarily unavailable. Try again shortly.",
  looksUnavailable: "Saved looks are temporarily unavailable. Try again shortly.",
  lookNotFound: "That saved look is no longer available.",
  foreignGarment: "A look can only be saved from garments you own.",
  invalidLook: "Choose garments from your wardrobe to save this look.",
} as const;
