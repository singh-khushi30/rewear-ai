"use client";

import { useId, useRef, useState } from "react";
import { motion } from "motion/react";
import { buttonClassName } from "@/components/button-link";
import { garmentFileAccept, garmentFileHint } from "@/lib/garment-file";
import { editorialEase } from "@/lib/motion";
import { cn } from "@/lib/cn";

export function UploadStage({
  error,
  onSelect,
}: {
  error: string | null;
  onSelect: (file: File) => void;
}) {
  const inputId = useId();
  const errorId = useId();
  const hintId = useId();
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) {
      onSelect(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.7, ease: editorialEase }}
      className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end"
    >
      <div>
        <p className="label text-olive mb-5">Your wardrobe</p>
        <h1 className="font-serif text-headline text-olive text-balance">
          Start with one piece.
        </h1>
        <p className="text-ink mt-6 max-w-md text-[1.05rem] leading-relaxed">
          Upload a clear photo of something you already own. We’ll understand
          the piece before we start styling it.
        </p>
      </div>

      <div>
        <input
          id={inputId}
          type="file"
          accept={garmentFileAccept}
          className="sr-only"
          aria-label="Garment photo"
          aria-invalid={error ? true : undefined}
          aria-describedby={`${hintId}${error ? ` ${errorId}` : ""}`}
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />

        <label
          htmlFor={inputId}
          onDragEnter={(event) => {
            event.preventDefault();
            dragDepth.current += 1;
            setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            dragDepth.current = Math.max(0, dragDepth.current - 1);
            if (dragDepth.current === 0) {
              setDragging(false);
            }
          }}
          onDrop={(event) => {
            event.preventDefault();
            dragDepth.current = 0;
            setDragging(false);
            handleFiles(event.dataTransfer.files);
          }}
          className={cn(
            "border-olive/20 min-h-[22rem] block cursor-pointer border px-6 py-16 text-center transition-colors duration-500 sm:min-h-[26rem] sm:px-10",
            dragging && "border-olive bg-ivory-warm",
          )}
        >
          <p className="sr-only" aria-live="polite">
            {dragging ? "Drop the image to add it." : ""}
          </p>
          <p className="font-serif text-olive text-3xl leading-tight sm:text-4xl">
            {dragging ? "Release to add it" : "Place your photograph"}
          </p>
          <p className="text-ink mt-4 text-sm leading-relaxed sm:text-base">
            Click or drag a clear photo of the garment.
          </p>
          <p id={hintId} className="label text-olive/55 mt-8">
            {garmentFileHint}
          </p>
          <span className="mt-10 block">
            <span className={buttonClassName("primary")}>Choose Image</span>
          </span>
        </label>

        {error ? (
          <p
            id={errorId}
            role="alert"
            className="text-umber mt-4 text-sm"
          >
            {error}
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}
