import { createPlanningGraph, invokePlanningGraph } from "./graph.js";
import type { PlanningRequestInput } from "./schemas.js";
import type { PlannerGarment, PlanningRunResult } from "./types.js";
import type { PlanningGraphNodes } from "./graph.js";

export type RunPlanning = (input: {
  request: PlanningRequestInput;
  wardrobe: PlannerGarment[];
}) => Promise<PlanningRunResult>;

export function createRunPlanning(nodes: PlanningGraphNodes = {}): RunPlanning {
  const graph = createPlanningGraph(nodes);
  return (input) => invokePlanningGraph(graph, input);
}

export const runPlanning = createRunPlanning();
