import assert from "node:assert/strict";
import { test } from "node:test";
import { ApiError } from "@google/genai";
import type { GoogleGenAI } from "@google/genai";
import { createAnalyzeGarmentImage } from "./analyze-garment.js";
import { AnalysisValidationError } from "./schema.js";

const validJson = JSON.stringify({
  category: "skirt",
  subcategory: "midi skirt",
  primaryColor: "black",
  material: "satin-like",
  materialBasis: "inferred",
  pattern: "solid",
  silhouette: "midi",
  fit: "relaxed",
  formality: "smart-casual",
  season: "all-season",
  warmth: "light",
  styleTags: ["minimal"],
});

const input = {
  buffer: Buffer.from("fake-image"),
  mimeType: "image/jpeg" as const,
  requestId: "req-1",
  userId: "user-1",
};

function mockClient(responses: Array<() => Promise<{ text?: string }>>) {
  let calls = 0;

  return {
    models: {
      generateContent: async () => {
        const next = responses[calls];
        calls += 1;
        if (!next) {
          throw new Error("unexpected extra Gemini call");
        }

        return next();
      },
    },
    calls: () => calls,
  };
}

test("retries a 503 high-demand response and then succeeds", async () => {
  const busy = () =>
    Promise.reject(
      new ApiError({
        status: 503,
        message: JSON.stringify({
          error: {
            code: 503,
            status: "UNAVAILABLE",
            message: "This model is currently experiencing high demand.",
          },
        }),
      }),
    );

  const client = mockClient([
    busy,
    async () => ({ text: validJson }),
  ]);

  const analyze = createAnalyzeGarmentImage(
    client as unknown as GoogleGenAI,
    "gemini-3.6-flash",
    { delayMs: 0 },
  );

  const analysis = await analyze(input);

  assert.equal(analysis.category, "Midi Skirt");
  assert.equal(client.calls(), 2);
});

test("does not retry invalid structured responses", async () => {
  const client = mockClient([async () => ({ text: "{" })]);
  const analyze = createAnalyzeGarmentImage(
    client as unknown as GoogleGenAI,
    "gemini-3.6-flash",
    { delayMs: 0 },
  );

  await assert.rejects(() => analyze(input), AnalysisValidationError);
  assert.equal(client.calls(), 1);
});
