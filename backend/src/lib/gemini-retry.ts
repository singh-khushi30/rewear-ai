import { isTransientGeminiFailure } from "./analysis/gemini-error.js";

export const MAX_GEMINI_ATTEMPTS = 3;
export const GEMINI_RETRY_DELAY_MS = 700;

export type TransientGeminiRetryOptions = {
  maxAttempts?: number;
  delayMs?: number;
  isFatal?: (error: unknown) => boolean;
  onRetry?: (nextAttempt: number, maxAttempts: number) => void;
};

function sleep(ms: number) {
  if (ms <= 0) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function withTransientGeminiRetry<T>(
  operation: () => Promise<T>,
  options: TransientGeminiRetryOptions = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? MAX_GEMINI_ATTEMPTS;
  const delayMs = options.delayMs ?? GEMINI_RETRY_DELAY_MS;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (
        options.isFatal?.(error) ||
        !isTransientGeminiFailure(error) ||
        attempt >= maxAttempts
      ) {
        throw error;
      }

      options.onRetry?.(attempt + 1, maxAttempts);
      await sleep(delayMs * attempt);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Gemini request failed.");
}
