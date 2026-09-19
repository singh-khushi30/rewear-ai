export const acceptedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const acceptedImageExtensions = [".jpg", ".jpeg", ".png", ".webp"] as const;

export const maxGarmentBytes = 10 * 1024 * 1024;

export const garmentFileAccept = [
  ...acceptedImageTypes,
  ...acceptedImageExtensions,
].join(",");

export const garmentFileHint = "JPG, PNG or WEBP · Max 10 MB";

export function garmentFileExtension(file: File) {
  const name = file.name.toLowerCase();

  if (name.endsWith(".jpeg")) {
    return "jpeg";
  }
  if (name.endsWith(".jpg")) {
    return "jpg";
  }
  if (name.endsWith(".png")) {
    return "png";
  }
  if (name.endsWith(".webp")) {
    return "webp";
  }
  if (file.type === "image/png") {
    return "png";
  }
  if (file.type === "image/webp") {
    return "webp";
  }

  return "jpg";
}

function hasAcceptedExtension(name: string) {
  const lower = name.toLowerCase();
  return acceptedImageExtensions.some((extension) => lower.endsWith(extension));
}

export function validateGarmentFile(file: File): string | null {
  const typeOk = acceptedImageTypes.includes(
    file.type as (typeof acceptedImageTypes)[number],
  );
  const extensionOk = hasAcceptedExtension(file.name);

  if (!typeOk && !extensionOk) {
    return "Use a JPG, PNG or WEBP image.";
  }

  if (file.size > maxGarmentBytes) {
    return "Choose an image under 10 MB.";
  }

  return null;
}
