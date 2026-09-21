import cors from "cors";
import express from "express";
import { attachRequestId } from "./lib/request-id.js";
import type { AnalyzeGarmentImage } from "./lib/analysis/analyze-garment.js";
import type { VerifyAccessToken } from "./middleware/require-auth.js";
import { createGarmentsRouter } from "./routes/garments.js";
import { healthRouter } from "./routes/health.js";

export function createApp(options?: {
  verifyAccessToken?: VerifyAccessToken;
  analyzeGarmentImage?: AnalyzeGarmentImage;
}) {
  const app = express();
  const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";

  app.use(
    cors({
      origin: frontendOrigin,
      allowedHeaders: ["Authorization", "Content-Type"],
    }),
  );
  app.use(express.json());
  app.use(attachRequestId);
  app.use("/health", healthRouter);
  app.use("/api/garments", createGarmentsRouter(options));

  return app;
}
