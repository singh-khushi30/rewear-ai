import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const frontendDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  agentRules: false,
  outputFileTracingRoot: path.join(frontendDir, ".."),
  serverExternalPackages: [
    "@google/genai",
    "@langchain/core",
    "@langchain/langgraph",
    "cors",
    "express",
    "multer",
  ],
};

export default nextConfig;
