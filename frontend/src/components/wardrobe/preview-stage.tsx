"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/button-link";
import { GarmentFrame } from "@/components/wardrobe/garment-frame";
import { garmentFileAccept } from "@/lib/garment-file";
import { editorialEase } from "@/lib/motion";

export function PreviewStage({
  previewUrl,
  error,
  onSelect,
  onRemove,
  onAnalyze,
}: {
  previewUrl: string;
  error: string | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
  onAnalyze: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.7, ease: editorialEase }}
      className="grid min-w-0 items-end gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
    >
      <div className="min-w-0">
        <p className="label text-olive mb-4">Your piece</p>
        <GarmentFrame src={previewUrl} alt="Selected garment" />
      </div>

      <div className="max-w-md">
        <h1 className="font-serif text-headline text-olive text-balance">
          This is the piece.
        </h1>
        <p className="text-ink mt-5 text-[1.05rem] leading-relaxed">
          A clear photograph is enough. We’ll read the garment before asking
          how you want to wear it.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={garmentFileAccept}
          aria-label="Replace garment photo"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onSelect(file);
            }
            event.target.value = "";
          }}
        />

        {error ? (
          <p role="alert" className="text-umber mt-5 text-sm">
            {error}
          </p>
        ) : null}

        <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-4">
          <Button onClick={onAnalyze}>Analyze Piece</Button>
          <Button variant="secondary" onClick={() => inputRef.current?.click()}>
            Choose Another
          </Button>
          <Button variant="secondary" onClick={onRemove}>
            Remove
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
