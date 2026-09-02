import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { prisma } from "@/lib/prisma";
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
//
// saveImage artık hem dosyayı diske yazar hem de MediaAsset kaydı oluşturur.
// Böylece merkezi medya kütüphanesi referans sayımı yapabilir.
export async function saveImage(file: File): Promise<
  { ok: true; url: string; fileName: string; sizeBytes: number; mimeType: string } | { ok: false; error: string }
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
  const url = `/api/media/${fileName}`;

  await mkdir(mediaDir(), { recursive: true });
  await writeFile(path.join(mediaDir(), fileName), buffer);

  await prisma.mediaAsset.create({
    data: {
      url,
      fileName,
      mimeType: file.type,
      sizeBytes: file.size,
      refs: [],
    },
  });

  return { ok: true, url, fileName, sizeBytes: file.size, mimeType: file.type };
}

// Dosyayı yalnızca hiçbir referans kalmadığında fiziksel olarak siler.
// Referanslar MediaAsset.refs JSON alanında tutulur.
export async function deleteMediaIfUnused(fileName: string): Promise<void> {
  const asset = await prisma.mediaAsset.findUnique({ where: { fileName } });
  if (!asset) return;

  const refs = Array.isArray(asset.refs) ? asset.refs : [];
  if (refs.length > 0) return;

  try {
    await unlink(path.join(mediaDir(), fileName));
  } catch {
    // Dosya zaten yoksa sorun değil.
  }
  await prisma.mediaAsset.delete({ where: { fileName } });
}

export async function listMediaAssets() {
  const assets = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Referans durumunu gerçek varlık tablolarından hesapla.
  return Promise.all(
    assets.map(async (asset) => {
      const [productRef, categoryRef, pageRef, homepageRef, heroRef] =
        await Promise.all([
          prisma.productImage.count({ where: { url: asset.url } }),
          prisma.category.count({ where: { image: asset.url } }),
          prisma.cmsPage.count({ where: { content: { contains: asset.url } } }),
          prisma.homepageContent.count({
            where: {
              OR: [
                { heroImageDesktop: asset.url },
                { heroImageMobile: asset.url },
                { storyImage: asset.url },
              ],
            },
          }),
          prisma.heroSlide.count({ where: { imageUrl: asset.url } }),
        ]);
      const refCount = productRef + categoryRef + pageRef + homepageRef + heroRef;
      return { ...asset, refCount };
    }),
  );
}
