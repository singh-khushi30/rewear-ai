import assert from "node:assert/strict";
import { test } from "node:test";
import { formatSavedDate, pieceCountLabel, saveLookLabel } from "./format";
import { savedLookToPieces } from "./pieces";

test("save look labels follow the idle / saving / saved states", () => {
  assert.equal(saveLookLabel("idle"), "♡ Save look");
  assert.equal(saveLookLabel("error"), "♡ Save look");
  assert.equal(saveLookLabel("saving"), "Saving…");
  assert.equal(saveLookLabel("saved"), "♥ Saved");
});

test("saved dates stay compact and human", () => {
  assert.match(
    formatSavedDate("2026-09-24T18:00:00.000Z", new Date("2026-12-01T00:00:00.000Z")),
    /^Saved Sep \d{1,2}$/,
  );
  assert.match(
    formatSavedDate("2025-09-24T18:00:00.000Z", new Date("2026-12-01T00:00:00.000Z")),
    /2025/,
  );
});

test("piece counts stay readable", () => {
  assert.equal(pieceCountLabel(1), "1 piece");
  assert.equal(pieceCountLabel(2), "2 pieces");
});

test("saved looks reconstruct composition pieces without inventing garments", () => {
  const pieces = savedLookToPieces({
    id: "look-1",
    title: "Casual summer",
    occasion: "Casual summer",
    rationale: "Light and simple.",
    createdAt: "2026-09-24T12:00:00.000Z",
    pieces: [
      {
        id: "top-1",
        category: "Camisole",
        primaryColor: "White",
        imageUrl: "https://example.com/top.jpg",
      },
      {
        id: "skirt-1",
        category: "Denim skirt",
        primaryColor: "Blue",
        imageUrl: "https://example.com/skirt.jpg",
      },
    ],
  });

  assert.deepEqual(
    pieces.map((piece) => piece.id),
    ["top-1", "skirt-1"],
  );
  assert.equal(
    pieces.every((piece) => piece.owned),
    true,
  );
});
