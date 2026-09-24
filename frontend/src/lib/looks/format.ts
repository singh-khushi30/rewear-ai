import type { SaveLookStatus } from "./types";

export function saveLookLabel(status: SaveLookStatus) {
  switch (status) {
    case "saving":
      return "Saving…";
    case "saved":
      return "♥ Saved";
    default:
      return "♡ Save look";
  }
}

export function formatSavedDate(iso: string, now = new Date()) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "Saved";
  }

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  if (date.getFullYear() !== now.getFullYear()) {
    options.year = "numeric";
  }

  return `Saved ${date.toLocaleDateString("en-US", options)}`;
}

export function pieceCountLabel(count: number) {
  return count === 1 ? "1 piece" : `${count} pieces`;
}
