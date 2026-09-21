import assert from "node:assert/strict";
import { test } from "node:test";
import {
  AnalysisValidationError,
  parseGarmentExtraction,
  toGarmentAnalysis,
} from "./schema.js";

const validExtraction = {
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
  styleTags: ["minimal", "evening"],
};

test("valid structured Gemini output maps to GarmentAnalysis", () => {
  const analysis = toGarmentAnalysis(parseGarmentExtraction(validExtraction));

  assert.deepEqual(analysis, {
    category: "Midi Skirt",
    primaryColor: "Black",
    material: "Satin-like",
    silhouette: "Midi · Relaxed",
    formality: "Smart casual",
    season: "All season",
  });
});

test("observed material is not prefixed as likely", () => {
  const analysis = toGarmentAnalysis(
    parseGarmentExtraction({
      ...validExtraction,
      material: "denim",
      materialBasis: "observed",
      fit: "regular",
      subcategory: "skirt",
    }),
  );

  assert.equal(analysis.material, "denim");
  assert.equal(analysis.category, "Skirt");
  assert.equal(analysis.silhouette, "Midi");
});

test("unknown material stays conservative", () => {
  const analysis = toGarmentAnalysis(
    parseGarmentExtraction({
      ...validExtraction,
      material: "cotton",
      materialBasis: "unknown",
    }),
  );

  assert.equal(analysis.material, "Unknown");
});

test("malformed Gemini response is rejected", () => {
  assert.throws(
    () => parseGarmentExtraction({ category: "not-a-garment" }),
    AnalysisValidationError,
  );
});

test("missing required fields are rejected", () => {
  assert.throws(() => parseGarmentExtraction({}), AnalysisValidationError);
});
