import { useEffect } from "react";

const previewUrls = new WeakMap<File, string>();

function previewUrlFor(file: File) {
  const cached = previewUrls.get(file);
  if (cached) {
    return cached;
  }

  const url = URL.createObjectURL(file);
  previewUrls.set(file, url);
  return url;
}

export function useObjectUrl(file: File | null) {
  const url = file ? previewUrlFor(file) : null;

  useEffect(() => {
    if (!file) {
      return;
    }

    return () => {
      const cached = previewUrls.get(file);
      if (cached) {
        URL.revokeObjectURL(cached);
        previewUrls.delete(file);
      }
    };
  }, [file]);

  return url;
}
