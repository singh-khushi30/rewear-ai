import cors from "cors";
import express from "express";
import { attachRequestId } from "./lib/request-id.js";
import type { AnalyzeGarmentImage } from "./lib/analysis/analyze-garment.js";
import type {
  DeleteLook,
  GetLook,
  ListLooks,
  LoadOwnedGarments,
  SaveLook,
} from "./looks/types.js";
import type { VerifyAccessToken } from "./middleware/require-auth.js";
import type { RunPlanning } from "./planning/run.js";
import type { LoadPlannerWardrobe } from "./planning/wardrobe.js";
import { createGarmentsRouter } from "./routes/garments.js";
import { healthRouter } from "./routes/health.js";
import { createLooksRouter } from "./routes/looks.js";
import { createPlansRouter } from "./routes/plans.js";

export function createApp(options?: {
  verifyAccessToken?: VerifyAccessToken;
  analyzeGarmentImage?: AnalyzeGarmentImage;
  loadPlannerWardrobe?: LoadPlannerWardrobe;
  runPlanning?: RunPlanning;
  loadOwnedGarments?: LoadOwnedGarments;
  saveLook?: SaveLook;
  listLooks?: ListLooks;
  getLook?: GetLook;
  deleteLook?: DeleteLook;
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
  app.use("/api/plans", createPlansRouter(options));
  app.use("/api/looks", createLooksRouter(options));

  return app;
}
