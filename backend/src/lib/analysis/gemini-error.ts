import { ApiError } from "@google/genai";

const secretPatterns = [
  /AIza[0-9A-Za-z_-]{8,}/g,
  /Bearer\s+\S+/gi,
  /(?:api[_-]?key|access[_-]?token|authorization)\s*[:=]\s*[^&\s"]+/gi,
  /sk-[A-Za-z0-9_-]{10,}/g,
];

export function sanitizeGeminiDiagnostic(value: string) {
  let next = value.replace(/[A-Za-z0-9+/]{80,}={0,2}/g, "[redacted-binary]");

  for (const pattern of secretPatterns) {
    next = next.replace(pattern, "[redacted]");
  }

  if (next.length > 400) {
    return `${next.slice(0, 400)}…`;
  }

  return next;
}

export type GeminiFailureDiagnostic = {
  type: string;
  status: number | null;
  code: string | null;
  message: string;
};

export function describeGeminiFailure(error: unknown): GeminiFailureDiagnostic {
  const type = error instanceof Error ? error.name : typeof error;
  let status: number | null = error instanceof ApiError ? error.status : null;
  let code: string | null = null;
  let message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unknown Gemini error";

  const parsed = parseErrorBody(message);
  if (parsed) {
    if (typeof parsed.code === "number" || typeof parsed.code === "string") {
      code = String(parsed.code);
    }
    if (typeof parsed.status === "string") {
      code = parsed.status;
    } else if (typeof parsed.status === "number" && status === null) {
      status = parsed.status;
    }
    if (typeof parsed.message === "string" && parsed.message.length > 0) {
      message = parsed.message;
    }
  }

  if (error instanceof ApiError && status === null) {
    status = error.status;
  }

  return {
    type,
    status,
    code,
    message: sanitizeGeminiDiagnostic(message),
  };
}

export function formatGeminiFailureLog(
  diagnostic: GeminiFailureDiagnostic,
  model: string,
) {
  return `[analyze] gemini status=${diagnostic.status ?? "unknown"} code=${diagnostic.code ?? "unknown"} type=${diagnostic.type} model=${model} message=${diagnostic.message}`;
}

type GoogleErrorBody = {
  code?: unknown;
  status?: unknown;
  message?: unknown;
};

function parseErrorBody(message: string): GoogleErrorBody | null {
  const parsed = parseJsonObject(message) ?? parseEmbeddedJson(message);
  if (!parsed) {
    return null;
  }

  if (isRecord(parsed.error)) {
    return parsed.error;
  }

  return parsed;
}

function parseEmbeddedJson(message: string) {
  const embedded = message.match(/\{[\s\S]*\}/);
  if (!embedded?.[0]) {
    return null;
  }

  return parseJsonObject(embedded[0]);
}

function parseJsonObject(value: string) {
  try {
    const parsed: unknown = JSON.parse(value);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is GoogleErrorBody & {
  error?: unknown;
} {
  return typeof value === "object" && value !== null;
}
