export function authReasonMessage(reason: string | null | undefined) {
  if (reason === "unconfigured") {
    return "Authentication is not configured in this environment yet.";
  }

  if (reason === "confirm-failed") {
    return "That confirmation link is invalid or has expired. Sign in or request a new one.";
  }

  return null;
}
