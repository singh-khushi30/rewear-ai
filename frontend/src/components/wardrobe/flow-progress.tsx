import { cn } from "@/lib/cn";
import type { FlowStep } from "@/types/garment";

const steps = [
  { id: "item", label: "Item" },
  { id: "details", label: "Details" },
  { id: "context", label: "Context" },
] as const;

function stepIndex(step: FlowStep) {
  if (step === "details") {
    return 1;
  }
  if (step === "preferences" || step === "complete") {
    return 2;
  }
  return 0;
}

export function FlowProgress({ step }: { step: FlowStep }) {
  const current = stepIndex(step);

  return (
    <ol
      aria-label="Progress"
      className="flex flex-wrap items-center gap-x-3 gap-y-2"
    >
      {steps.map((item, index) => {
        const state =
          index < current ? "complete" : index === current ? "current" : "upcoming";

        return (
          <li key={item.id} className="flex items-center gap-3">
            <span
              className={cn(
                "label",
                state === "upcoming" && "text-olive/35",
                state === "complete" && "text-olive/70",
                state === "current" && "text-olive",
              )}
              aria-current={state === "current" ? "step" : undefined}
            >
              <span className="lining-nums tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>{" "}
              {item.label}
            </span>
            {index < steps.length - 1 ? (
              <span aria-hidden="true" className="text-olive/25">
                —
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
