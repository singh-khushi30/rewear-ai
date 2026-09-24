import { Router } from "express";
import { sendError, userSafeMessages } from "../lib/http.js";
import {
  ForeignGarmentError,
  LooksUnavailableError,
} from "../looks/errors.js";
import { saveLookRequestSchema, savedLookIdSchema } from "../looks/schemas.js";
import {
  defaultLookTitle,
  deleteLook as defaultDeleteLook,
  getLook as defaultGetLook,
  listLooks as defaultListLooks,
  loadOwnedGarments as defaultLoadOwnedGarments,
  saveLook as defaultSaveLook,
} from "../looks/store.js";
import type {
  DeleteLook,
  GetLook,
  ListLooks,
  LoadOwnedGarments,
  SaveLook,
} from "../looks/types.js";
import { requireAuth, type VerifyAccessToken } from "../middleware/require-auth.js";

export function createLooksRouter(options?: {
  verifyAccessToken?: VerifyAccessToken;
  loadOwnedGarments?: LoadOwnedGarments;
  saveLook?: SaveLook;
  listLooks?: ListLooks;
  getLook?: GetLook;
  deleteLook?: DeleteLook;
}) {
  const router = Router();
  const loadOwnedGarments =
    options?.loadOwnedGarments ?? defaultLoadOwnedGarments;
  const saveLook = options?.saveLook ?? defaultSaveLook;
  const listLooks = options?.listLooks ?? defaultListLooks;
  const getLook = options?.getLook ?? defaultGetLook;
  const deleteLook = options?.deleteLook ?? defaultDeleteLook;

  router.get("/", requireAuth(options?.verifyAccessToken), async (req, res) => {
    const accessToken = req.accessToken;
    if (!accessToken) {
      sendError(res, 401, "UNAUTHENTICATED", userSafeMessages.unauthenticated);
      return;
    }

    try {
      const looks = await listLooks(accessToken);
      res.status(200).json({ success: true, looks });
    } catch (error) {
      if (error instanceof LooksUnavailableError) {
        sendError(res, 503, "LOOKS_UNAVAILABLE", userSafeMessages.looksUnavailable);
        return;
      }

      sendError(res, 503, "LOOKS_UNAVAILABLE", userSafeMessages.looksUnavailable);
    }
  });

  router.post("/", requireAuth(options?.verifyAccessToken), async (req, res) => {
    const userId = req.user?.id;
    const accessToken = req.accessToken;

    if (!userId || !accessToken) {
      sendError(res, 401, "UNAUTHENTICATED", userSafeMessages.unauthenticated);
      return;
    }

    const parsed = saveLookRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, 400, "INVALID_REQUEST", userSafeMessages.invalidLook);
      return;
    }

    try {
      const owned = await loadOwnedGarments(accessToken, parsed.data.garmentIds);
      const ownedIds = new Set(owned.map((garment) => garment.id));
      if (parsed.data.garmentIds.some((id) => !ownedIds.has(id))) {
        sendError(res, 422, "FOREIGN_GARMENT", userSafeMessages.foreignGarment);
        return;
      }

      const occasion = parsed.data.occasion ?? "";
      const look = await saveLook({
        accessToken,
        userId,
        title: parsed.data.title ?? defaultLookTitle(occasion),
        occasion,
        rationale: parsed.data.rationale,
        garmentIds: parsed.data.garmentIds,
      });

      res.status(200).json({ success: true, look });
    } catch (error) {
      if (error instanceof ForeignGarmentError) {
        sendError(res, 422, "FOREIGN_GARMENT", userSafeMessages.foreignGarment);
        return;
      }

      if (error instanceof LooksUnavailableError) {
        sendError(res, 503, "LOOKS_UNAVAILABLE", userSafeMessages.looksUnavailable);
        return;
      }

      sendError(res, 503, "LOOKS_UNAVAILABLE", userSafeMessages.looksUnavailable);
    }
  });

  router.get("/:id", requireAuth(options?.verifyAccessToken), async (req, res) => {
    const accessToken = req.accessToken;
    if (!accessToken) {
      sendError(res, 401, "UNAUTHENTICATED", userSafeMessages.unauthenticated);
      return;
    }

    const parsed = savedLookIdSchema.safeParse(req.params.id);
    if (!parsed.success) {
      sendError(res, 400, "INVALID_REQUEST", userSafeMessages.invalidLook);
      return;
    }

    try {
      const look = await getLook(accessToken, parsed.data);
      if (!look) {
        sendError(res, 404, "LOOK_NOT_FOUND", userSafeMessages.lookNotFound);
        return;
      }

      res.status(200).json({ success: true, look });
    } catch (error) {
      if (error instanceof LooksUnavailableError) {
        sendError(res, 503, "LOOKS_UNAVAILABLE", userSafeMessages.looksUnavailable);
        return;
      }

      sendError(res, 503, "LOOKS_UNAVAILABLE", userSafeMessages.looksUnavailable);
    }
  });

  router.delete(
    "/:id",
    requireAuth(options?.verifyAccessToken),
    async (req, res) => {
      const accessToken = req.accessToken;
      if (!accessToken) {
        sendError(res, 401, "UNAUTHENTICATED", userSafeMessages.unauthenticated);
        return;
      }

      const parsed = savedLookIdSchema.safeParse(req.params.id);
      if (!parsed.success) {
        sendError(res, 400, "INVALID_REQUEST", userSafeMessages.invalidLook);
        return;
      }

      try {
        const deleted = await deleteLook(accessToken, parsed.data);
        if (!deleted) {
          sendError(res, 404, "LOOK_NOT_FOUND", userSafeMessages.lookNotFound);
          return;
        }

        res.status(200).json({ success: true });
      } catch (error) {
        if (error instanceof LooksUnavailableError) {
          sendError(
            res,
            503,
            "LOOKS_UNAVAILABLE",
            userSafeMessages.looksUnavailable,
          );
          return;
        }

        sendError(res, 503, "LOOKS_UNAVAILABLE", userSafeMessages.looksUnavailable);
      }
    },
  );

  return router;
}
