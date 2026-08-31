import "server-only";

import { createHash } from "node:crypto";

import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function sanitizeCommunityImage(input: Buffer) {
  if (!input.length || input.length > MAX_BYTES)
    throw new Error("Photo must be between 1 byte and 10 MB.");
  const detected = await fileTypeFromBuffer(input);
  if (!detected || !ALLOWED.has(detected.mime))
    throw new Error(
      "Only real JPEG, PNG, and WebP raster photos are accepted.",
    );

  const source = sharp(input, {
    animated: false,
    failOn: "warning",
    limitInputPixels: 36_000_000,
  });
  const metadata = await source.metadata();
  if (
    !metadata.width ||
    !metadata.height ||
    metadata.width < 320 ||
    metadata.height < 320 ||
    metadata.width > 12_000 ||
    metadata.height > 12_000
  ) {
    throw new Error(
      "Photo dimensions must be between 320 and 12,000 pixels on each side.",
    );
  }

  const sanitized = await source
    .rotate()
    .resize({
      width: 2400,
      height: 2400,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 84, smartSubsample: true })
    .toBuffer({ resolveWithObject: true });

  return {
    originalMime: detected.mime,
    originalExtension: detected.ext,
    sanitizedBuffer: sanitized.data,
    sanitizedMime: "image/webp" as const,
    width: sanitized.info.width,
    height: sanitized.info.height,
    sha256: createHash("sha256").update(sanitized.data).digest("hex"),
  };
}
