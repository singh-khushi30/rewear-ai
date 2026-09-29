import assert from "node:assert/strict";
import { test } from "node:test";
import { ApiError } from "@google/genai";
import type { GoogleGenAI } from "@google/genai";
import { generatePlanningJson } from "./llm.js";
import { PlanningParseError } from "./schemas.js";

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

const request = {
  systemInstruction: "Return JSON.",
  userPrompt: "Plan an outfit.",
  responseJsonSchema: { type: "object" },
  delayMs: 0,
};

test("retries a 503 high-demand planning call and then succeeds", async () => {
  const client = mockClient([
    () =>
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
      ),
    async () => ({ text: '{"mode":"outfit"}' }),
  ]);

  const parsed = await generatePlanningJson({
    ...request,
    client: client as unknown as GoogleGenAI,
  });

  assert.deepEqual(parsed, { mode: "outfit" });
  assert.equal(client.calls(), 2);
});

test("does not retry invalid planning JSON", async () => {
  const client = mockClient([async () => ({ text: "{" })]);

  await assert.rejects(
    () =>
      generatePlanningJson({
        ...request,
        client: client as unknown as GoogleGenAI,
      }),
    PlanningParseError,
  );
  assert.equal(client.calls(), 1);
});
