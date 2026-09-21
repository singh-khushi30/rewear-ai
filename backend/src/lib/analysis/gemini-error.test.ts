import assert from "node:assert/strict";
import { test } from "node:test";
import { ApiError } from "@google/genai";
import {
  describeGeminiFailure,
  sanitizeGeminiDiagnostic,
} from "./gemini-error.js";

test("sanitizes API keys and long binary payloads", () => {
  const sanitized = sanitizeGeminiDiagnostic(
    "API key AIzaSyDummyKeyValue1234567890 and Bearer secret-token-value and " +
      "a".repeat(80),
  );

  assert.doesNotMatch(sanitized, /AIza/);
  assert.doesNotMatch(sanitized, /Bearer secret-token-value/);
  assert.match(sanitized, /\[redacted\]/);
});

test("extracts Google status fields from ApiError JSON", () => {
  const error = new ApiError({
    status: 404,
    message: JSON.stringify({
      error: {
        code: 404,
        status: "NOT_FOUND",
        message: "models/not-a-model is not found for API version v1beta",
      },
    }),
  });

  assert.deepEqual(describeGeminiFailure(error), {
    type: "ApiError",
    status: 404,
    code: "NOT_FOUND",
    message: "models/not-a-model is not found for API version v1beta",
  });
});
