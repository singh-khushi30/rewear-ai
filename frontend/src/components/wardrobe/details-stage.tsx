"use client";

import { motion } from "motion/react";
import { Button } from "@/components/button-link";
import { GarmentFrame } from "@/components/wardrobe/garment-frame";
import { editorialEase } from "@/lib/motion";
import {
  garmentAnalysisFields,
  type GarmentAnalysis,
} from "@/types/garment";

export function DetailsStage({
  previewUrl,
  analysis,
  onChange,
  onStartOver,
  onConfirm,
}: {
  previewUrl: string;
  analysis: GarmentAnalysis;
  onChange: (key: keyof GarmentAnalysis, value: string) => void;
  onStartOver: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.7, ease: editorialEase }}
      className="grid min-w-0 items-start gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
    >
      <div className="min-w-0">
        <p className="label text-olive mb-4">Your piece</p>
        <GarmentFrame src={previewUrl} alt="Uploaded garment" />
      </div>

      <div>
        <p className="label text-olive mb-5">Detected</p>
        <h1 className="font-serif text-headline text-olive text-balance">
          We found this.
        </h1>
        <p className="text-ink mt-5 max-w-md text-[1.05rem] leading-relaxed">
          Not quite right? Adjust anything before adding it to your wardrobe.
        </p>

        <div className="mt-10 grid gap-7 sm:grid-cols-2">
          {garmentAnalysisFields.map((field) => (
            <label key={field.key} className="block min-w-0">
              <span className="label text-olive/70">{field.label}</span>
              <input
                value={analysis[field.key]}
                onChange={(event) => onChange(field.key, event.target.value)}
                className="font-serif text-olive mt-2 w-full border-0 border-b border-stone bg-transparent py-2 text-xl outline-none focus-visible:border-olive"
              />
            </label>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
          <Button onClick={onConfirm}>Looks Right</Button>
          <Button variant="secondary" onClick={onStartOver}>
            Start Over
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
