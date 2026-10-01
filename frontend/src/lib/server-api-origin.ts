import { headers } from "next/headers";
import { getApiUrl } from "./api";

export async function getServerApiOrigin() {
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host"))
    ?.split(",")[0]
    ?.trim();
  const proto = h.get("x-forwarded-proto") ?? "https";

  if (host) {
    return `${proto}://${host}`;
  }

  return getApiUrl();
}
