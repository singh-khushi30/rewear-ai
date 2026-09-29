import type { GoogleGenAI } from "@google/genai";
import { createGeminiClient, getGeminiModel } from "../lib/gemini.js";
import { withTransientGeminiRetry } from "../lib/gemini-retry.js";
import {
  candidatePlanJsonSchema,
  constraintsJsonSchema,
  parseCandidatePlan,
  parseNormalizedConstraints,
  PlanningParseError,
} from "./schemas.js";

export class PlanningUnavailableError extends Error {
  constructor() {
    super("Planning is unavailable.");
    this.name = "PlanningUnavailableError";
  }
}

export async function generatePlanningJson(input: {
  systemInstruction: string;
  userPrompt: string;
  responseJsonSchema: Record<string, unknown>;
  client?: GoogleGenAI | null;
  model?: string;
  maxAttempts?: number;
  delayMs?: number;
}): Promise<unknown> {
  const client = input.client === undefined ? createGeminiClient() : input.client;
  if (!client) {
    throw new PlanningUnavailableError();
  }

  return withTransientGeminiRetry(
    async () => {
      const response = await client.models.generateContent({
        model: input.model ?? getGeminiModel(),
        contents: input.userPrompt,
        config: {
          systemInstruction: input.systemInstruction,
          temperature: 0.2,
          responseMimeType: "application/json",
          responseJsonSchema: input.responseJsonSchema,
        },
      });

      const text = response.text?.trim();
      if (!text) {
        throw new PlanningParseError();
      }

      try {
        return JSON.parse(text) as unknown;
      } catch {
        throw new PlanningParseError();
      }
    },
    {
      maxAttempts: input.maxAttempts,
      delayMs: input.delayMs,
      isFatal: (error) => error instanceof PlanningParseError,
      onRetry: (nextAttempt, maxAttempts) => {
        console.info(
          `[plan] retry=${nextAttempt}/${maxAttempts} reason=transient`,
        );
      },
    },
  );
}

export async function generateNormalizedConstraints(input: {
  systemInstruction: string;
  userPrompt: string;
  client?: GoogleGenAI | null;
  model?: string;
}) {
  const parsed = await generatePlanningJson({
    ...input,
    responseJsonSchema: constraintsJsonSchema,
  });
  return parseNormalizedConstraints(parsed);
}

export async function generateCandidatePlan(input: {
  systemInstruction: string;
  userPrompt: string;
  client?: GoogleGenAI | null;
  model?: string;
}) {
  const parsed = await generatePlanningJson({
    ...input,
    responseJsonSchema: candidatePlanJsonSchema,
  });
  return parseCandidatePlan(parsed);
}
