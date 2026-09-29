import type { GoogleGenAI } from "@google/genai";
import {
  AnalysisValidationError,
  garmentResponseJsonSchema,
  parseGarmentExtraction,
  toGarmentAnalysis,
  type GarmentAnalysis,
} from "./schema.js";
import {
  garmentAnalysisSystemPrompt,
  garmentAnalysisUserPrompt,
} from "./prompt.js";
import type { AcceptedImageType } from "../image.js";
import { createGeminiClient, getGeminiModel } from "../gemini.js";
import {
  GEMINI_RETRY_DELAY_MS,
  MAX_GEMINI_ATTEMPTS,
  withTransientGeminiRetry,
} from "../gemini-retry.js";

export class AnalysisUnavailableError extends Error {
  constructor() {
    super("Garment analysis is unavailable.");
    this.name = "AnalysisUnavailableError";
  }
}

export type AnalyzeGarmentImageInput = {
  buffer: Buffer;
  mimeType: AcceptedImageType;
  requestId: string;
  userId: string;
};

export type AnalyzeGarmentImage = (
  input: AnalyzeGarmentImageInput,
) => Promise<GarmentAnalysis>;

export const MAX_ANALYSIS_ATTEMPTS = MAX_GEMINI_ATTEMPTS;
export const ANALYSIS_RETRY_DELAY_MS = GEMINI_RETRY_DELAY_MS;

export type AnalyzeGarmentImageOptions = {
  maxAttempts?: number;
  delayMs?: number;
};

export function createAnalyzeGarmentImage(
  client: GoogleGenAI | null = createGeminiClient(),
  model = getGeminiModel(),
  options: AnalyzeGarmentImageOptions = {},
): AnalyzeGarmentImage {
  return async (input) => {
    if (!client) {
      throw new AnalysisUnavailableError();
    }

    return withTransientGeminiRetry(
      () => requestGarmentAnalysis(client, model, input),
      {
        maxAttempts: options.maxAttempts,
        delayMs: options.delayMs,
        isFatal: (error) => error instanceof AnalysisValidationError,
        onRetry: (nextAttempt, maxAttempts) => {
          console.info(
            `[analyze] requestId=${input.requestId} retry=${nextAttempt}/${maxAttempts} reason=transient`,
          );
        },
      },
    );
  };
}

async function requestGarmentAnalysis(
  client: GoogleGenAI,
  model: string,
  input: AnalyzeGarmentImageInput,
): Promise<GarmentAnalysis> {
  const response = await client.models.generateContent({
    model,
    contents: [
      {
        inlineData: {
          mimeType: input.mimeType,
          data: input.buffer.toString("base64"),
        },
      },
      garmentAnalysisUserPrompt,
    ],
    config: {
      systemInstruction: garmentAnalysisSystemPrompt,
      temperature: 0.2,
      responseMimeType: "application/json",
      responseJsonSchema: garmentResponseJsonSchema,
    },
  });

  const text = response.text?.trim();
  if (!text) {
    throw new AnalysisValidationError();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new AnalysisValidationError();
  }

  return toGarmentAnalysis(parseGarmentExtraction(parsed));
}
