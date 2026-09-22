import type { Metadata } from "next";
import { PlanWorkspace } from "@/components/plan/plan-workspace";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Plan — REWEAR",
  description:
    "Tell REWEAR where you’re going, what you need, or what you want to wear differently.",
};

export default function PlanPage() {
  return <PlanWorkspace />;
}
