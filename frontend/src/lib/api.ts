function isLocalDevApiUrl(url: string) {
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

export function getApiUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");
  const isProduction = process.env.NODE_ENV === "production";

  if (configured && !(isProduction && isLocalDevApiUrl(configured))) {
    return configured;
  }

  // Production (Vercel): same-origin Express at /api. Local `next dev`: Express on :4000.
  return isProduction ? "" : "http://localhost:4000";
}
