import "dotenv/config";
import cors from "cors";
import express from "express";
import { healthRouter } from "./routes/health.js";

const app = express();
const port = Number.parseInt(process.env.PORT ?? "4000", 10);
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";

app.use(
  cors({
    origin: frontendOrigin,
  }),
);
app.use(express.json());

app.use("/health", healthRouter);

app.listen(port, () => {
  console.log(`rewear-api listening on http://localhost:${port}`);
});
