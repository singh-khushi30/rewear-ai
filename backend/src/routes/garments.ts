import { Router, type ErrorRequestHandler } from "express";
import multer, { MulterError } from "multer";
import {
  createAnalyzeGarmentImage,
  AnalysisUnavailableError,
  type AnalyzeGarmentImage,
} from "../lib/analysis/analyze-garment.js";
import { AnalysisValidationError } from "../lib/analysis/schema.js";
import {
  maxGarmentBytes,
  sniffImageMime,
  isAcceptedImageType,
} from "../lib/image.js";
import {
  sendAnalysis,
  sendError,
  userSafeMessages,
} from "../lib/http.js";
import { shortenUserId } from "../lib/request-id.js";
import {
  describeGeminiFailure,
  formatGeminiFailureLog,
} from "../lib/analysis/gemini-error.js";
import { getGeminiModel } from "../lib/gemini.js";
import { requireAuth, type VerifyAccessToken } from "../middleware/require-auth.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxGarmentBytes,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!isAcceptedImageType(file.mimetype)) {
      callback(new Error("UNSUPPORTED_IMAGE"));
      return;
    }

    callback(null, true);
  },
});

export function createGarmentsRouter(options?: {
  verifyAccessToken?: VerifyAccessToken;
  analyzeGarmentImage?: AnalyzeGarmentImage;
}) {
  const router = Router();
  const analyze =
    options?.analyzeGarmentImage ?? createAnalyzeGarmentImage();

  router.post(
    "/analyze",
    requireAuth(options?.verifyAccessToken),
    upload.single("image"),
    async (req, res) => {
      const startedAt = Date.now();
      const requestId = req.requestId;
      const userId = req.user?.id;

      if (!userId) {
        sendError(res, 401, "UNAUTHENTICATED", userSafeMessages.unauthenticated);
        return;
      }

      const file = req.file;
      if (!file?.buffer) {
        sendError(res, 400, "INVALID_IMAGE", userSafeMessages.invalidImage);
        return;
      }

      if (file.size > maxGarmentBytes || file.buffer.length > maxGarmentBytes) {
        sendError(res, 400, "IMAGE_TOO_LARGE", userSafeMessages.imageTooLarge);
        return;
      }

      const mimeType = sniffImageMime(file.buffer);
      if (!mimeType) {
        sendError(
          res,
          400,
          "UNSUPPORTED_IMAGE",
          userSafeMessages.unsupportedImage,
        );
        return;
      }

      try {
        const analysis = await analyze({
          buffer: file.buffer,
          mimeType,
          requestId,
          userId,
        });

        console.info(
          `[analyze] requestId=${requestId} user=${shortenUserId(userId)} mime=${mimeType} bytes=${file.buffer.length} model=${getGeminiModel()} result=success latencyMs=${Date.now() - startedAt}`,
        );

        sendAnalysis(res, analysis);
      } catch (error) {
        if (error instanceof AnalysisValidationError) {
          console.info(
            `[analyze] requestId=${requestId} user=${shortenUserId(userId)} mime=${mimeType} bytes=${file.buffer.length} model=${getGeminiModel()} result=invalid_response latencyMs=${Date.now() - startedAt}`,
          );
          sendError(
            res,
            502,
            "ANALYSIS_FAILED",
            userSafeMessages.analysisFailed,
          );
          return;
        }

        if (error instanceof AnalysisUnavailableError) {
          console.info(
            `[analyze] requestId=${requestId} user=${shortenUserId(userId)} mime=${mimeType} bytes=${file.buffer.length} model=${getGeminiModel()} result=unavailable latencyMs=${Date.now() - startedAt}`,
          );
          sendError(
            res,
            503,
            "ANALYSIS_UNAVAILABLE",
            userSafeMessages.analysisUnavailable,
          );
          return;
        }

        console.info(
          `[analyze] requestId=${requestId} user=${shortenUserId(userId)} mime=${mimeType} bytes=${file.buffer.length} model=${getGeminiModel()} result=failed latencyMs=${Date.now() - startedAt}`,
        );
        if (process.env.NODE_ENV !== "production") {
          console.info(
            formatGeminiFailureLog(describeGeminiFailure(error), getGeminiModel()),
          );
        }
        sendError(res, 502, "ANALYSIS_FAILED", userSafeMessages.analysisFailed);
      }
    },
  );

  const handleUploadError: ErrorRequestHandler = (error, _req, res, next) => {
    if (error instanceof MulterError && error.code === "LIMIT_FILE_SIZE") {
      sendError(res, 400, "IMAGE_TOO_LARGE", userSafeMessages.imageTooLarge);
      return;
    }

    if (error instanceof MulterError && error.code === "LIMIT_UNEXPECTED_FILE") {
      sendError(res, 400, "INVALID_IMAGE", userSafeMessages.invalidImage);
      return;
    }

    if (error instanceof Error && error.message === "UNSUPPORTED_IMAGE") {
      sendError(
        res,
        400,
        "UNSUPPORTED_IMAGE",
        userSafeMessages.unsupportedImage,
      );
      return;
    }

    next(error);
  };

  router.use(handleUploadError);

  return router;
}
