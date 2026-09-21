import type { RequestHandler } from "express";
import { sendError, userSafeMessages } from "../lib/http.js";
import { createSupabaseAuthClient } from "../lib/supabase.js";

export class AuthConfigError extends Error {
  constructor() {
    super("Supabase auth client is not configured.");
    this.name = "AuthConfigError";
  }
}

export type VerifiedUser = {
  id: string;
};

export type VerifyAccessToken = (
  accessToken: string,
) => Promise<VerifiedUser | null>;

export const verifyAccessToken: VerifyAccessToken = async (accessToken) => {
  const supabase = createSupabaseAuthClient();
  if (!supabase) {
    throw new AuthConfigError();
  }

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) {
    return null;
  }

  return { id: data.user.id };
};

export function requireAuth(
  verify: VerifyAccessToken = verifyAccessToken,
): RequestHandler {
  return (req, res, next) => {
    const header = req.get("authorization") ?? "";
    const match = /^Bearer\s+(\S+)/i.exec(header);
    const token = match?.[1];

    if (!token) {
      sendError(res, 401, "UNAUTHENTICATED", userSafeMessages.unauthenticated);
      return;
    }

    void verify(token)
      .then((user) => {
        if (!user) {
          sendError(
            res,
            401,
            "UNAUTHENTICATED",
            userSafeMessages.unauthenticated,
          );
          return;
        }

        req.user = user;
        next();
      })
      .catch((error: unknown) => {
        if (error instanceof AuthConfigError) {
          sendError(
            res,
            503,
            "ANALYSIS_UNAVAILABLE",
            userSafeMessages.analysisUnavailable,
          );
          return;
        }

        sendError(res, 401, "UNAUTHENTICATED", userSafeMessages.unauthenticated);
      });
  };
}
