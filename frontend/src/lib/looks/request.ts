import { getApiUrl } from "@/lib/api";
import {
  SavedLookError,
  savedLookErrorMessage,
  type SavedLookErrorCode,
} from "./errors";
import type { SavedLook } from "./types";

type LookResponse =
  | { success: true; look: SavedLook }
  | { success: true; looks: SavedLook[] }
  | { success: true }
  | {
      success: false;
      error?: { code?: string; message?: string };
    };

function errorCodeFromResponse(
  status: number,
  code: string | undefined,
): SavedLookErrorCode {
  if (
    code === "UNAUTHENTICATED" ||
    code === "INVALID_REQUEST" ||
    code === "FOREIGN_GARMENT" ||
    code === "LOOK_NOT_FOUND" ||
    code === "LOOKS_UNAVAILABLE"
  ) {
    return code;
  }

  if (status === 401) {
    return "UNAUTHENTICATED";
  }

  if (status === 404) {
    return "LOOK_NOT_FOUND";
  }

  return "LOOKS_UNAVAILABLE";
}

export async function looksRequest(
  accessToken: string,
  path: string,
  init: RequestInit = {},
) {
  let response: Response;
  try {
    response = await fetch(`${getApiUrl()}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new SavedLookError(savedLookErrorMessage("NETWORK"), "NETWORK");
  }

  let payload: LookResponse | null = null;
  try {
    payload = (await response.json()) as LookResponse;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload || payload.success !== true) {
    const code = errorCodeFromResponse(
      response.status,
      payload && payload.success === false ? payload.error?.code : undefined,
    );
    throw new SavedLookError(savedLookErrorMessage(code), code);
  }

  return payload;
}

export async function requestSavedLooks(accessToken: string) {
  const payload = await looksRequest(accessToken, "/api/looks");
  return "looks" in payload ? payload.looks : [];
}

export async function requestSavedLook(accessToken: string, id: string) {
  const payload = await looksRequest(accessToken, `/api/looks/${id}`);
  if (!("look" in payload)) {
    throw new SavedLookError(savedLookErrorMessage("LOOK_NOT_FOUND"), "LOOK_NOT_FOUND");
  }

  return payload.look;
}
