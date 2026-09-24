"use client";

import { useState } from "react";
import { saveLook } from "@/lib/looks/api";
import { SavedLookError } from "@/lib/looks/errors";
import { saveLookLabel } from "@/lib/looks/format";
import type { SaveLookStatus } from "@/lib/looks/types";

export function SaveLookButton({
  occasion,
  rationale,
  garmentIds,
}: {
  occasion: string;
  rationale: string;
  garmentIds: string[];
}) {
  const [status, setStatus] = useState<SaveLookStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  if (garmentIds.length === 0) {
    return null;
  }

  const pending = status === "saving";
  const saved = status === "saved";

  const submit = async () => {
    if (pending || saved) {
      return;
    }

    setStatus("saving");
    setError(null);

    try {
      await saveLook({ occasion, rationale, garmentIds });
      setStatus("saved");
    } catch (caught) {
      setStatus("error");
      setError(
        caught instanceof SavedLookError
          ? caught.message
          : "We couldn’t save that look. Try again.",
      );
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={() => {
          void submit();
        }}
        disabled={pending || saved}
        aria-label={saved ? "Look saved" : "Save look"}
        className="label text-olive/70 hover:text-olive disabled:text-olive disabled:opacity-100 transition-colors duration-500 disabled:pointer-events-none"
      >
        {saveLookLabel(status)}
      </button>
      {error ? (
        <p role="alert" className="text-umber max-w-[14rem] text-right text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}
