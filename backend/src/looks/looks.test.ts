import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { once } from "node:events";
import { createServer } from "node:http";
import { test } from "node:test";
import { createApp } from "../app.js";
import { lookFingerprint } from "./fingerprint.js";
import type { OwnedGarment, SavedLookRecord } from "./types.js";

const here = dirname(fileURLToPath(import.meta.url));

const ownerId = "11111111-1111-4111-8111-111111111111";
const otherId = "22222222-2222-4222-8222-222222222222";
const topId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const skirtId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const foreignId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

const ownedGarments: OwnedGarment[] = [
  {
    id: topId,
    category: "Camisole",
    primaryColor: "White",
    imagePath: `${ownerId}/top.jpg`,
  },
  {
    id: skirtId,
    category: "Denim skirt",
    primaryColor: "Blue",
    imagePath: `${ownerId}/skirt.jpg`,
  },
];

function publicLook(
  look: Omit<SavedLookRecord, "pieces"> & { garmentIds: string[] },
): SavedLookRecord {
  return {
    id: look.id,
    title: look.title,
    occasion: look.occasion,
    rationale: look.rationale,
    createdAt: look.createdAt,
    pieces: look.garmentIds.map((id) => {
      const garment = ownedGarments.find((item) => item.id === id);
      return {
        id,
        category: garment?.category ?? "Unavailable",
        primaryColor: garment?.primaryColor ?? "",
        imageUrl: garment ? `https://example.com/${id}.jpg` : null,
      };
    }),
  };
}

function createLooksHarness() {
  const garments = new Map(ownedGarments.map((garment) => [garment.id, garment]));
  const looks = new Map<
    string,
    {
      id: string;
      userId: string;
      title: string;
      occasion: string;
      rationale: string;
      fingerprint: string;
      createdAt: string;
      garmentIds: string[];
    }
  >();

  return {
    garments,
    looks,
    loadOwnedGarments: async (_token: string, garmentIds: string[]) =>
      garmentIds.flatMap((id) => {
        const garment = garments.get(id);
        return garment ? [garment] : [];
      }),
    saveLook: async (input: {
      userId: string;
      title: string;
      occasion: string;
      rationale: string;
      garmentIds: string[];
    }) => {
      const fingerprint = lookFingerprint(input.garmentIds);
      for (const existing of looks.values()) {
        if (
          existing.userId === input.userId &&
          existing.fingerprint === fingerprint
        ) {
          return publicLook(existing);
        }
      }

      const record = {
        id: crypto.randomUUID(),
        userId: input.userId,
        title: input.title,
        occasion: input.occasion,
        rationale: input.rationale,
        fingerprint,
        createdAt: "2026-09-24T12:00:00.000Z",
        garmentIds: [...input.garmentIds],
      };
      looks.set(record.id, record);
      return publicLook(record);
    },
    listLooks: async (userId: string) =>
      [...looks.values()]
        .filter((look) => look.userId === userId)
        .map(publicLook),
    getLook: async (userId: string, lookId: string) => {
      const look = looks.get(lookId);
      if (!look || look.userId !== userId) {
        return null;
      }

      return publicLook(look);
    },
    deleteLook: async (userId: string, lookId: string) => {
      const look = looks.get(lookId);
      if (!look || look.userId !== userId) {
        return false;
      }

      looks.delete(lookId);
      return true;
    },
  };
}

function looksApp(
  harness: ReturnType<typeof createLooksHarness>,
  userByToken: Record<string, string> = {
    "owner-token": ownerId,
    "other-token": otherId,
  },
) {
  return createApp({
    verifyAccessToken: async (token) => {
      const id = userByToken[token];
      return id ? { id } : null;
    },
    loadOwnedGarments: harness.loadOwnedGarments,
    saveLook: async (input) => harness.saveLook(input),
    listLooks: async (token) => {
      const userId = userByToken[token];
      return userId ? harness.listLooks(userId) : [];
    },
    getLook: async (token, lookId) => {
      const userId = userByToken[token];
      return userId ? harness.getLook(userId, lookId) : null;
    },
    deleteLook: async (token, lookId) => {
      const userId = userByToken[token];
      return userId ? harness.deleteLook(userId, lookId) : false;
    },
  });
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
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}

const saveBody = {
  occasion: "Casual summer",
  rationale: "The camisole and denim skirt keep the look light.",
  garmentIds: [topId, skirtId],
};

test("unauthenticated save is rejected", async () => {
  await withServer(looksApp(createLooksHarness()), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/looks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(saveBody),
    });
    const payload = await response.json();

    assert.equal(response.status, 401);
    assert.equal(payload.error.code, "UNAUTHENTICATED");
  });
});

test("a user can save their own wardrobe garment IDs", async () => {
  await withServer(looksApp(createLooksHarness()), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/looks`, {
      method: "POST",
      headers: {
        Authorization: "Bearer owner-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(saveBody),
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.success, true);
    assert.equal(payload.look.occasion, "Casual summer");
    assert.deepEqual(
      payload.look.pieces.map((piece: { id: string }) => piece.id),
      [topId, skirtId],
    );
    assert.equal(payload.look.userId, undefined);
    assert.equal(payload.look.fingerprint, undefined);
  });
});

test("a foreign garment ID is rejected", async () => {
  await withServer(looksApp(createLooksHarness()), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/looks`, {
      method: "POST",
      headers: {
        Authorization: "Bearer owner-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...saveBody,
        garmentIds: [topId, foreignId],
      }),
    });
    const payload = await response.json();

    assert.equal(response.status, 422);
    assert.equal(payload.error.code, "FOREIGN_GARMENT");
  });
});

test("a saved look returns garments in the submitted order", async () => {
  await withServer(looksApp(createLooksHarness()), async (baseUrl) => {
    const saved = await fetch(`${baseUrl}/api/looks`, {
      method: "POST",
      headers: {
        Authorization: "Bearer owner-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...saveBody,
        garmentIds: [skirtId, topId],
      }),
    });
    const created = await saved.json();

    const listed = await fetch(`${baseUrl}/api/looks`, {
      headers: { Authorization: "Bearer owner-token" },
    });
    const listPayload = await listed.json();

    assert.deepEqual(
      created.look.pieces.map((piece: { id: string }) => piece.id),
      [skirtId, topId],
    );
    assert.deepEqual(
      listPayload.looks[0].pieces.map((piece: { id: string }) => piece.id),
      [skirtId, topId],
    );
  });
});

test("a user cannot read another user’s saved look", async () => {
  const harness = createLooksHarness();
  await withServer(looksApp(harness), async (baseUrl) => {
    const saved = await fetch(`${baseUrl}/api/looks`, {
      method: "POST",
      headers: {
        Authorization: "Bearer owner-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(saveBody),
    });
    const created = await saved.json();

    const listed = await fetch(`${baseUrl}/api/looks`, {
      headers: { Authorization: "Bearer other-token" },
    });
    const detail = await fetch(`${baseUrl}/api/looks/${created.look.id}`, {
      headers: { Authorization: "Bearer other-token" },
    });
    const listPayload = await listed.json();
    const detailPayload = await detail.json();

    assert.deepEqual(listPayload.looks, []);
    assert.equal(detail.status, 404);
    assert.equal(detailPayload.error.code, "LOOK_NOT_FOUND");
  });
});

test("a user cannot delete another user’s saved look", async () => {
  await withServer(looksApp(createLooksHarness()), async (baseUrl) => {
    const saved = await fetch(`${baseUrl}/api/looks`, {
      method: "POST",
      headers: {
        Authorization: "Bearer owner-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(saveBody),
    });
    const created = await saved.json();

    const removed = await fetch(`${baseUrl}/api/looks/${created.look.id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer other-token" },
    });
    const payload = await removed.json();

    const stillThere = await fetch(`${baseUrl}/api/looks/${created.look.id}`, {
      headers: { Authorization: "Bearer owner-token" },
    });

    assert.equal(removed.status, 404);
    assert.equal(payload.error.code, "LOOK_NOT_FOUND");
    assert.equal(stillThere.status, 200);
  });
});

test("deleting a look does not delete garments", async () => {
  const harness = createLooksHarness();
  await withServer(looksApp(harness), async (baseUrl) => {
    const saved = await fetch(`${baseUrl}/api/looks`, {
      method: "POST",
      headers: {
        Authorization: "Bearer owner-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(saveBody),
    });
    const created = await saved.json();

    const removed = await fetch(`${baseUrl}/api/looks/${created.look.id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer owner-token" },
    });

    assert.equal(removed.status, 200);
    assert.equal(harness.looks.has(created.look.id), false);
    assert.equal(harness.garments.has(topId), true);
    assert.equal(harness.garments.has(skirtId), true);
  });
});

test("a malformed save payload is rejected", async () => {
  await withServer(looksApp(createLooksHarness()), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/looks`, {
      method: "POST",
      headers: {
        Authorization: "Bearer owner-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rationale: "",
        garmentIds: ["not-a-uuid"],
      }),
    });
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.error.code, "INVALID_REQUEST");
  });
});

test("double-submit of the same look is idempotent", async () => {
  await withServer(looksApp(createLooksHarness()), async (baseUrl) => {
    const first = await fetch(`${baseUrl}/api/looks`, {
      method: "POST",
      headers: {
        Authorization: "Bearer owner-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(saveBody),
    });
    const second = await fetch(`${baseUrl}/api/looks`, {
      method: "POST",
      headers: {
        Authorization: "Bearer owner-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(saveBody),
    });
    const firstPayload = await first.json();
    const secondPayload = await second.json();
    const listed = await fetch(`${baseUrl}/api/looks`, {
      headers: { Authorization: "Bearer owner-token" },
    });
    const listPayload = await listed.json();

    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal(firstPayload.look.id, secondPayload.look.id);
    assert.equal(listPayload.looks.length, 1);
  });
});

test("saved-look reconstruction does not call planning or image generation", () => {
  const store = readFileSync(join(here, "store.ts"), "utf8");
  const routes = readFileSync(join(here, "../routes/looks.ts"), "utf8");

  for (const source of [store, routes]) {
    assert.doesNotMatch(source, /runPlanning|LangGraph|generateContent|flash-image|visualize/);
  }
});

test("saved looks migration enforces ownership RLS and garment cascades", () => {
  const sql = readFileSync(
    join(here, "../../supabase/migrations/20260924120000_saved_looks.sql"),
    "utf8",
  );

  assert.match(sql, /create table if not exists public.saved_looks/);
  assert.match(sql, /create table if not exists public.saved_look_items/);
  assert.match(sql, /unique \(user_id, fingerprint\)/);
  assert.match(sql, /references public.garments \(id\) on delete cascade/);
  assert.match(sql, /enable row level security/);
  assert.match(sql, /saved_looks_select_own/);
  assert.match(sql, /saved_looks_insert_own/);
  assert.match(sql, /saved_looks_delete_own/);
  assert.match(sql, /garment.user_id = auth.uid\(\)/);
  assert.doesNotMatch(sql, /service_role/);
});
