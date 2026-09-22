export type PlanningErrorCode =
  | "UNAUTHENTICATED"
  | "INVALID_REQUEST"
  | "EMPTY_WARDROBE"
  | "UNSATISFIED_CONSTRAINTS"
  | "PLANNING_FAILED"
  | "PLANNING_UNAVAILABLE"
  | "NETWORK";

export class PlanningError extends Error {
  constructor(
    message: string,
    readonly code: PlanningErrorCode,
    readonly violationCodes: string[] = [],
  ) {
    super(message);
    this.name = "PlanningError";
  }
}

export function planningErrorMessage(code: PlanningErrorCode) {
  switch (code) {
    case "UNAUTHENTICATED":
      return "Sign in to plan from the wardrobe you already own.";
    case "INVALID_REQUEST":
      return "Tell REWEAR what you need in a short request.";
    case "EMPTY_WARDROBE":
      return "Add a few pieces to your wardrobe first. REWEAR can only plan with what you already own.";
    case "UNSATISFIED_CONSTRAINTS":
      return "I couldn’t satisfy every constraint with the pieces you own.";
    case "PLANNING_UNAVAILABLE":
    case "NETWORK":
      return "Planning is temporarily unavailable. Try again shortly.";
    default:
      return "We couldn’t finish this plan. Try again shortly.";
  }
}
