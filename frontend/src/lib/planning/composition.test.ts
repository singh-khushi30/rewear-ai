import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { composeOutfitSlots } from "./garment-role";
import { resolveLookPieces } from "./look";

const here = dirname(fileURLToPath(import.meta.url));
const frontendRoot = join(here, "../..");

const forbidden = [
  /\/api\/plans\/visualize/,
  /gemini-3\.1-flash-image/,
  /requestOutfitPreview/,
  /retryOutfitPreview/,
  /Creating outfit preview/,
  /Try preview again/,
  /Preview unavailable/,
  /GEMINI_IMAGE_MODEL/,
];

const activeFiles = [
  "components/plan/plan-results.tsx",
  "components/plan/outfit-composition.tsx",
  "components/plan/plan-workspace.tsx",
  "lib/planning/generate-plan.ts",
  "lib/planning/look.ts",
  "lib/planning/garment-role.ts",
  "app/looks/page.tsx",
  "app/looks/[id]/page.tsx",
];

test("normal planning UI never requests image generation", () => {
  for (const relative of activeFiles) {
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

test("plan results render OutfitComposition instead of image generation", () => {
  const source = readFileSync(
    join(frontendRoot, "components/plan/plan-results.tsx"),
    "utf8",
  );

  assert.match(source, /OutfitComposition/);
  assert.doesNotMatch(source, /useEffect/);
  assert.doesNotMatch(source, /fetch\(/);
});

test("generatePlan only calls the planner contract", () => {
  const source = readFileSync(
    join(frontendRoot, "lib/planning/generate-plan.ts"),
    "utf8",
  );

  assert.match(source, /\/api\/plans\/generate/);
  assert.doesNotMatch(source, /visualize/);
  assert.doesNotMatch(source, /flash-image/);
});

test("plan results compose exactly the planner-selected garments", () => {
  const garments = new Map([
    [
      "top-1",
      {
        id: "top-1",
        category: "Camisole",
        primary_color: "White",
        imageUrl: "https://example.com/top-1.jpg",
      },
    ],
    [
      "skirt-1",
      {
        id: "skirt-1",
        category: "Denim skirt",
        primary_color: "Blue",
        imageUrl: "https://example.com/skirt-1.jpg",
      },
    ],
  ]);
  const selected = ["top-1", "skirt-1"];
  const pieces = resolveLookPieces(selected, garments);
  const slots = composeOutfitSlots(pieces);

  assert.deepEqual(
    pieces.map((piece) => piece.id),
    selected,
  );
  assert.equal(slots.upper?.id, "top-1");
  assert.equal(slots.lower?.id, "skirt-1");
});
