function isLocalDevApiUrl(url: string) {
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function originFromHost(host: string | undefined) {
  const trimmed = host?.trim().replace(/\/$/, "");
  if (!trimmed) {
    return "";
  }

  return trimmed.startsWith("http://") || trimmed.startsWith("https://")
    ? trimmed
    : `https://${trimmed}`;
}

export function getApiUrlFromEnv(
  env: NodeJS.Dict<string | undefined>,
  isBrowser: boolean,
) {
  const configured = env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");
  const isProduction = env.NODE_ENV === "production";

  if (configured && !(isProduction && isLocalDevApiUrl(configured))) {
    return configured;
  }

  if (!isProduction) {
    return "http://localhost:4000";
  }

  // Browser: same-origin relative /api. Node fetch cannot use a relative URL.
  if (isBrowser) {
    return "";
  }

  return (
    originFromHost(env.VERCEL_URL) ||
    originFromHost(env.VERCEL_PROJECT_PRODUCTION_URL) ||
    "http://localhost:3000"
  );
}

export function getApiUrl() {
  return getApiUrlFromEnv(process.env, typeof window !== "undefined");
}
