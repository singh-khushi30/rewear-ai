import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const frontendRoot = join(here, "../..");

const forbidden = [
  /\/api\/plans\/generate/,
  /\/api\/plans\/visualize/,
  /gemini/i,
  /LangGraph/,
  /flash-image/,
  /generateContent/,
];

const files = [
  "app/looks/page.tsx",
  "app/looks/[id]/page.tsx",
  "app/looks/[id]/not-found.tsx",
  "components/looks/saved-looks-board.tsx",
  "components/looks/save-look-button.tsx",
  "components/looks/remove-saved-look.tsx",
  "lib/looks/api.ts",
  "lib/looks/request.ts",
  "lib/looks/pieces.ts",
];

test("opening saved looks never calls planning or image generation", () => {
  for (const relative of files) {
    const source = readFileSync(join(frontendRoot, relative), "utf8");

    for (const pattern of forbidden) {
      assert.doesNotMatch(
        source,
        pattern,
        `${relative} should not contain ${pattern}`,
      );
    }
  }
});

test("save look talks only to the looks API", () => {
  const source = readFileSync(join(frontendRoot, "lib/looks/api.ts"), "utf8");
  assert.match(source, /\/api\/looks/);
  assert.doesNotMatch(source, /\/api\/plans/);
});
