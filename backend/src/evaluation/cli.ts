import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import "../lib/env.js";
import { DEFAULT_LIVE_LIMIT } from "./constants.js";
import { evaluateScenarios } from "./run.js";
import { formatEvalReport } from "./report.js";

const here = dirname(fileURLToPath(import.meta.url));
const resultsDir = join(here, "../../evaluation/results");

function readArg(args: string[], flag: string) {
  const index = args.indexOf(flag);
  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
}

function parseLimit(value: string | undefined) {
  if (value === undefined) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Limit must be a non-negative integer.");
  }

  return parsed;
}

async function main() {
  const args = process.argv.slice(2);
  const live = args.includes("--live");
  const writeJson = !args.includes("--no-json");
  const all = args.includes("--all");
  const requestedLimit = parseLimit(readArg(args, "--limit"));
  const limit = all ? undefined : (requestedLimit ?? (live ? DEFAULT_LIVE_LIMIT : undefined));

  if (live) {
    if (process.env.REWEAR_EVAL_LIVE !== "1") {
      console.error(
        "Refusing to run live evaluation.\nSet REWEAR_EVAL_LIVE=1 and pass --live (npm run eval:live).",
      );
      process.exitCode = 2;
      return;
    }

    if (!process.env.GEMINI_API_KEY?.trim()) {
      console.error("GEMINI_API_KEY is required for live evaluation.");
      process.exitCode = 2;
      return;
    }
  }

  const report = await evaluateScenarios({
    live,
    limit,
  });

  console.log(formatEvalReport(report));

  if (writeJson) {
    await mkdir(resultsDir, { recursive: true });
    const filename = `eval-${report.mode}-${report.generatedAt.replace(/[:.]/g, "-")}.json`;
    const path = join(resultsDir, filename);
    await writeFile(path, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`\nJSON ${path}`);
  }

  if (report.aggregate.outcomes.FAIL > 0 && live) {
    process.exitCode = 1;
  }
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Evaluation failed.";
  console.error(message);
  process.exitCode = 1;
});
