import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  SavedLookError,
  savedLookErrorMessage,
} from "./errors";
import { looksRequest, requestSavedLook, requestSavedLooks } from "./request";

async function getAccessToken() {
  const supabase = createBrowserSupabaseClient();
  if (!supabase) {
    throw new SavedLookError(
      savedLookErrorMessage("LOOKS_UNAVAILABLE"),
      "LOOKS_UNAVAILABLE",
    );
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const accessToken = session?.access_token;
  if (!accessToken) {
    throw new SavedLookError(
      savedLookErrorMessage("UNAUTHENTICATED"),
      "UNAUTHENTICATED",
    );
  }

  return accessToken;
}

export async function saveLook(input: {
  occasion: string;
  rationale: string;
  garmentIds: string[];
}) {
  const accessToken = await getAccessToken();
  const payload = await looksRequest(accessToken, "/api/looks", {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (!("look" in payload)) {
    throw new SavedLookError(
      savedLookErrorMessage("LOOKS_UNAVAILABLE"),
      "LOOKS_UNAVAILABLE",
    );
  }

  return payload.look;
}

export async function deleteSavedLook(id: string) {
  const accessToken = await getAccessToken();
  await looksRequest(accessToken, `/api/looks/${id}`, { method: "DELETE" });
}

export async function fetchSavedLooks() {
  return requestSavedLooks(await getAccessToken());
}

export async function fetchSavedLook(id: string) {
  return requestSavedLook(await getAccessToken(), id);
}
