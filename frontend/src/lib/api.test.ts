import assert from "node:assert/strict";
import { test } from "node:test";
import { getApiUrlFromEnv } from "./api";

test("local development talks to Express on :4000", () => {
  assert.equal(
    getApiUrlFromEnv({ NODE_ENV: "development" }, false),
    "http://localhost:4000",
  );
});

test("production browser uses same-origin relative /api", () => {
  assert.equal(getApiUrlFromEnv({ NODE_ENV: "production" }, true), "");
});

test("production server uses the Vercel deployment origin", () => {
  assert.equal(
    getApiUrlFromEnv(
      { NODE_ENV: "production", VERCEL_URL: "rewear-ai.vercel.app" },
      false,
    ),
    "https://rewear-ai.vercel.app",
  );
});

test("production ignores a leftover localhost API URL", () => {
  assert.equal(
    getApiUrlFromEnv(
      {
        NODE_ENV: "production",
        NEXT_PUBLIC_API_URL: "http://localhost:4000",
        VERCEL_URL: "rewear-ai.vercel.app",
      },
      false,
    ),
    "https://rewear-ai.vercel.app",
  );
});
