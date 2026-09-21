export type AnalysisErrorCode =
  | "UNAUTHENTICATED"
  | "UNSUPPORTED_IMAGE"
  | "IMAGE_TOO_LARGE"
  | "INVALID_IMAGE"
  | "ANALYSIS_FAILED"
  | "ANALYSIS_UNAVAILABLE"
  | "NETWORK";

export class AnalysisError extends Error {
  constructor(
    message: string,
    readonly code: AnalysisErrorCode,
  ) {
    super(message);
    this.name = "AnalysisError";
  }
}

export function analysisErrorMessage(code: AnalysisErrorCode) {
  switch (code) {
    case "UNAUTHENTICATED":
      return "Your session has expired. Sign in again.";
    case "UNSUPPORTED_IMAGE":
      return "Use a JPG, PNG or WEBP image.";
    case "IMAGE_TOO_LARGE":
      return "Choose an image under 10 MB.";
    case "INVALID_IMAGE":
      return "We couldn’t read this photograph. Try another file.";
    case "ANALYSIS_UNAVAILABLE":
    case "NETWORK":
      return "Analysis is temporarily unavailable. Try again shortly.";
    default:
      return "We couldn’t read this piece clearly.";
  }
}
