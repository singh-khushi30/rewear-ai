import { GoogleGenAI } from "@google/genai";

export const defaultGeminiModel = "gemini-3.6-flash";

export function getGeminiModel() {
  const configured = process.env.GEMINI_MODEL?.trim();
  return configured && configured.length > 0 ? configured : defaultGeminiModel;
}

export function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  return new GoogleGenAI({ apiKey });
}
