"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSavedLook } from "@/lib/looks/api";
import { SavedLookError } from "@/lib/looks/errors";

export function RemoveSavedLook({ lookId }: { lookId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    if (pending) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      await deleteSavedLook(lookId);
      router.push("/looks");
      router.refresh();
    } catch (caught) {
      setPending(false);
      setError(
        caught instanceof SavedLookError
          ? caught.message
          : "We couldn’t remove that look. Try again.",
      );
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          void remove();
        }}
        disabled={pending}
        className="label text-olive/70 hover:text-olive transition-colors duration-500 disabled:opacity-40"
      >
        {pending ? "Removing…" : "Remove from saved"}
      </button>
      {error ? (
        <p role="alert" className="text-umber mt-3 text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}
