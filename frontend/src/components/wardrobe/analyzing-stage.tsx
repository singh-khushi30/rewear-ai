"use client";

import { motion } from "motion/react";
import { demoAnalysisStages } from "@/lib/analysis/analyze-garment";
import type { AnalysisProgress } from "@/lib/analysis/types";
import { editorialEase } from "@/lib/motion";
import { cn } from "@/lib/cn";

export function AnalyzingStage({
  progress,
  previewUrl,
}: {
  progress: AnalysisProgress | null;
  previewUrl: string | null;
}) {
  const currentIndex = progress?.index ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.7, ease: editorialEase }}
      className="grid min-w-0 items-center gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
    >
      {previewUrl ? (
        <div className="bg-olive relative mx-auto aspect-[3/4] w-full max-w-sm min-w-0 overflow-hidden lg:mx-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt=""
            className="h-full w-full object-cover opacity-80"
          />
        </div>
      ) : null}

      <div>
        <p className="label text-olive mb-5">Looking closely</p>
        <h1 className="font-serif text-headline text-olive text-balance">
          Getting to know your piece.
        </h1>

        <ol className="mt-12 space-y-6" aria-live="polite">
          {demoAnalysisStages.map((stage, index) => {
            const state =
              index < currentIndex
                ? "done"
                : index === currentIndex
                  ? "current"
                  : "upcoming";

            return (
              <li key={stage.id}>
                <p
                  className={cn(
                    "font-serif text-2xl transition-colors duration-700 sm:text-3xl",
                    state === "current" && "text-olive",
                    state === "done" && "text-olive/45",
                    state === "upcoming" && "text-olive/25",
                  )}
                >
                  {stage.label}
                </p>
                {state === "current" ? (
                  <motion.span
                    aria-hidden="true"
                    className="bg-olive mt-3 block h-px origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.2, ease: editorialEase }}
                  />
                ) : (
                  <span className="mt-3 block h-px" />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </motion.div>
  );
}
