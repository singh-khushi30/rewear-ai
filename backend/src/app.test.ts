import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer, type Server } from "node:http";
import { test } from "node:test";
import { createApp } from "./app.js";
import { AnalysisValidationError } from "./lib/analysis/schema.js";
import { maxGarmentBytes } from "./lib/image.js";
import {
  outfitConstraints,
  validOutfitPlan,
  wardrobe,
} from "./planning/fixtures.js";

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const validAnalysis = {
  category: "Skirt",
  primaryColor: "Black",
  material: "Satin-like",
  silhouette: "Midi · Relaxed",
  formality: "Smart casual",
  season: "All season",
};

function jpegOfSize(size: number) {
  const buffer = Buffer.alloc(size, 0);
  buffer[0] = 0xff;
  buffer[1] = 0xd8;
  buffer[2] = 0xff;
  return buffer;
}

async function withServer(
  app: ReturnType<typeof createApp>,
  run: (baseUrl: string) => Promise<void>,
) {
  const server = createServer(app);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new Error("Could not start test server.");
  }

  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await closeServer(server);
  }
}

function closeServer(server: Server) {
  return new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

function analyzeApp(overrides?: Parameters<typeof createApp>[0]) {
  return createApp({
    verifyAccessToken: async (token) =>
      token === "valid-token" ? { id: "user-12345678" } : null,
    analyzeGarmentImage: async () => validAnalysis,
    ...overrides,
  });
}

async function postAnalyze(
  baseUrl: string,
  options: {
    token?: string | null;
    blob: Blob;
    filename: string;
  },
) {
  const body = new FormData();
  body.append("image", options.blob, options.filename);

  const headers = new Headers();
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  } else if (options.token !== null) {
    headers.set("Authorization", "Bearer valid-token");
  }

  return fetch(`${baseUrl}/api/garments/analyze`, {
    method: "POST",
    headers,
    body,
  });
}

test("unauthenticated analyze request returns 401", async () => {
  await withServer(analyzeApp(), async (baseUrl) => {
    const response = await postAnalyze(baseUrl, {
      token: null,
      blob: new Blob([png], { type: "image/png" }),
      filename: "piece.png",
    });
    const payload = await response.json();

    assert.equal(response.status, 401);
    assert.equal(payload.success, false);
    assert.equal(payload.error.code, "UNAUTHENTICATED");
  });
});

test("invalid token returns 401", async () => {
  await withServer(analyzeApp(), async (baseUrl) => {
    const response = await postAnalyze(baseUrl, {
      token: "expired-token",
      blob: new Blob([png], { type: "image/png" }),
      filename: "piece.png",
    });
    const payload = await response.json();

    assert.equal(response.status, 401);
    assert.equal(payload.error.code, "UNAUTHENTICATED");
  });
});

test("invalid MIME is rejected", async () => {
  await withServer(analyzeApp(), async (baseUrl) => {
    const response = await postAnalyze(baseUrl, {
      blob: new Blob(["not-an-image"], { type: "text/plain" }),
      filename: "note.txt",
    });
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.error.code, "UNSUPPORTED_IMAGE");
  });
});

test("images over 10 MB are rejected", async () => {
  await withServer(analyzeApp(), async (baseUrl) => {
    const response = await postAnalyze(baseUrl, {
      blob: new Blob([jpegOfSize(maxGarmentBytes + 1)], { type: "image/jpeg" }),
      filename: "huge.jpg",
    });
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.error.code, "IMAGE_TOO_LARGE");
  });
});

test("malformed Gemini response becomes a controlled failure", async () => {
  await withServer(
    analyzeApp({
      analyzeGarmentImage: async () => {
        throw new AnalysisValidationError();
      },
    }),
    async (baseUrl) => {
      const response = await postAnalyze(baseUrl, {
        blob: new Blob([png], { type: "image/png" }),
        filename: "piece.png",
      });
      const payload = await response.json();

      assert.equal(response.status, 502);
      assert.equal(payload.success, false);
      assert.equal(payload.error.code, "ANALYSIS_FAILED");
      assert.equal(typeof payload.error.message, "string");
      assert.doesNotMatch(payload.error.message, /gemini|schema|stack/i);
    },
  );
});

test("unauthenticated planning request returns 401", async () => {
  await withServer(
    createApp({
      verifyAccessToken: async () => null,
      loadPlannerWardrobe: async () => wardrobe,
      runPlanning: async () => {
        throw new Error("planning should not run");
      },
    }),
    async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/plans/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request: "Give me 2 different outfits using only what I own.",
        }),
      });
      const payload = await response.json();

      assert.equal(response.status, 401);
      assert.equal(payload.success, false);
      assert.equal(payload.error.code, "UNAUTHENTICATED");
    },
  );
});

test("empty wardrobe is handled without invoking the planner", async () => {
  let planned = false;

  await withServer(
    createApp({
      verifyAccessToken: async (token) =>
        token === "valid-token" ? { id: "user-12345678" } : null,
      loadPlannerWardrobe: async () => [],
      runPlanning: async () => {
        planned = true;
        throw new Error("Gemini should not be called");
      },
    }),
    async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/plans/generate`, {
        method: "POST",
        headers: {
          Authorization: "Bearer valid-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request: "Give me 5 distinct outfits.",
        }),
      });
      const payload = await response.json();

      assert.equal(planned, false);
      assert.equal(response.status, 422);
      assert.equal(payload.success, false);
      assert.equal(payload.error.code, "EMPTY_WARDROBE");
      assert.doesNotMatch(payload.error.message, /gemini|prompt|stack/i);
    },
  );
});

test("valid planning result is returned without the raw wardrobe", async () => {
  await withServer(
    createApp({
      verifyAccessToken: async (token) =>
        token === "valid-token" ? { id: "user-12345678" } : null,
      loadPlannerWardrobe: async () => wardrobe,
      runPlanning: async () => ({
        status: "valid",
        plan: validOutfitPlan(),
        constraints: outfitConstraints(),
        validation: { valid: true, violations: [] },
        firstPassValid: true,
        repairAttempts: 0,
        finalValid: true,
        violationCodes: [],
        message: null,
      }),
    }),
    async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/plans/generate`, {
        method: "POST",
        headers: {
          Authorization: "Bearer valid-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request: "Give me 2 different outfits using only what I own.",
        }),
      });
      const payload = await response.json();

      assert.equal(response.status, 200);
      assert.equal(payload.success, true);
      assert.deepEqual(payload.plan, validOutfitPlan());
      assert.equal(payload.meta.lookCount, 2);
      assert.equal(payload.meta.repaired, false);
    },
  );
});

test("planning success returns no generated preview", async () => {
  await withServer(
    createApp({
      verifyAccessToken: async (token) =>
        token === "valid-token" ? { id: "user-12345678" } : null,
      loadPlannerWardrobe: async () => wardrobe,
      runPlanning: async () => ({
        status: "valid",
        plan: validOutfitPlan(),
        constraints: outfitConstraints(),
        validation: { valid: true, violations: [] },
        firstPassValid: true,
        repairAttempts: 0,
        finalValid: true,
        violationCodes: [],
        message: null,
      }),
    }),
    async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/plans/generate`, {
        method: "POST",
        headers: {
          Authorization: "Bearer valid-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request: "Give me 2 different outfits using only what I own.",
        }),
      });
      const payload = await response.json();

      assert.equal(response.status, 200);
      assert.equal(payload.success, true);
      assert.equal(payload.preview, undefined);
      assert.equal(payload.plan.outfits[0].preview, undefined);
      assert.deepEqual(payload.plan.outfits[0].garmentIds, [
        "top-1",
        "bottom-1",
        "shoe-1",
      ]);
    },
  );
});

test("image-generation visualize route is not registered", async () => {
  await withServer(createApp(), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/plans/visualize`, {
      method: "POST",
      headers: {
        Authorization: "Bearer valid-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        outfitId: "look-1",
        garmentIds: ["top-1"],
      }),
    });

    assert.equal(response.status, 404);
  });
});

test("valid structured response maps to GarmentAnalysis", async () => {
  await withServer(analyzeApp(), async (baseUrl) => {
    const response = await postAnalyze(baseUrl, {
      blob: new Blob([png], { type: "image/png" }),
      filename: "piece.png",
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(payload, {
      success: true,
      analysis: validAnalysis,
    });
  });
});
