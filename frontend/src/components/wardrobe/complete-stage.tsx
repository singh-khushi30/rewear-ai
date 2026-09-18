"use client";

import { motion } from "motion/react";
import { ButtonLink } from "@/components/button-link";
import { editorialEase } from "@/lib/motion";
import {
  occasions,
  styleDirections,
  weatherOptions,
  type GarmentAnalysis,
  type StylingPreferences,
} from "@/types/garment";

function labelsFor(
  ids: string[],
  options: ReadonlyArray<{ id: string; label: string }>,
) {
  return ids
    .map((id) => options.find((option) => option.id === id)?.label)
    .filter(Boolean)
    .join(" · ");
}

export function CompleteStage({
  previewUrl,
  analysis,
  preferences,
}: {
  previewUrl: string | null;
  analysis: GarmentAnalysis;
  preferences: StylingPreferences;
}) {
  const occasionSummary = labelsFor(preferences.occasions, occasions);
  const weatherSummary = weatherOptions.find(
    (option) => option.id === preferences.weather,
  )?.label;
  const styleSummary = styleDirections.find(
    (option) => option.id === preferences.styleDirection,
  )?.label;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.7, ease: editorialEase }}
      className="grid min-w-0 items-start gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"
    >
      {previewUrl ? (
        <div className="bg-olive relative aspect-[3/4] w-full min-w-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Garment added to the wardrobe"
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div>
        <p className="label text-olive mb-5">Temporary</p>
        <h1 className="font-serif text-headline text-olive text-balance">
          Your piece is ready.
        </h1>
        <p className="text-ink mt-6 max-w-xl text-[1.05rem] leading-relaxed">
          Next, REWEAR will combine what you own with your plans, constraints
          and style preferences.
        </p>

        <dl className="mt-12 space-y-8">
          <div>
            <dt className="label text-olive/70">Garment</dt>
            <dd className="font-serif text-olive mt-2 text-2xl">
              {analysis.primaryColor} {analysis.category}
              <span className="mt-1 block text-xl italic">
                {analysis.material} · {analysis.silhouette}
              </span>
            </dd>
          </div>
          <div>
            <dt className="label text-olive/70">Occasions</dt>
            <dd className="text-olive mt-2 text-lg">{occasionSummary || "—"}</dd>
          </div>
          <div>
            <dt className="label text-olive/70">Weather</dt>
            <dd className="text-olive mt-2 text-lg">{weatherSummary || "—"}</dd>
          </div>
          <div>
            <dt className="label text-olive/70">Style direction</dt>
            <dd className="text-olive mt-2 text-lg">{styleSummary || "—"}</dd>
          </div>
        </dl>

        <div className="mt-12">
          <ButtonLink href="/">Back to Home</ButtonLink>
        </div>
      </div>
    </motion.div>
  );
}
