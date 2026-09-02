import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { slugify } from "@/lib/slugify";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function getMediaContentType(fileName: string): string | null {
  const extension = fileName.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "avif":
      return "image/avif";
    default:
      return null;
  }
}

export function mediaDir(): string {
  return path.join(process.cwd(), "storage", "media");
}

// V1 storage adapter: yerel disk.
// Production'da R2/S3 driver'ı ile değiştirilebilir (PRD §45) —
// dönen public URL yapısı aynı kaldığı sürece çağıran kod etkilenmez.
export async function saveImage(file: File): Promise<
  { ok: true; url: string } | { ok: false; error: string }
> {
  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return { ok: false, error: "Desteklenmeyen dosya türü (JPEG, PNG, WebP, AVIF)" };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: "Dosya boyutu en fazla 5MB olabilir" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const baseName = slugify(file.name.replace(/\.[^.]+$/, "")) || "gorsel";
  const fileName = `${baseName}-${randomUUID().slice(0, 8)}.${extension}`;

  await mkdir(mediaDir(), { recursive: true });
  await writeFile(path.join(mediaDir(), fileName), buffer);

  return { ok: true, url: `/api/media/${fileName}` };
}
