import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Yüklenen görseller mağazada gösterilecek şekilde normalleştirilir: EXIF yönü
// düzeltilir, uzun kenar küçültülür ve varsayılan olarak WebP'ye çevrilir.
// Böylece 4MB'lık orijinaller yerine genelde ~200-400KB dosyalar saklanır ve
// kapak görselleri çok daha hızlı yüklenir.
const MAX_DIMENSION = 1920;
const WEBP_QUALITY = 80;

export type SaveImageOptions = {
  // "webp" (varsayılan) veya kaynak formatı koru ("original").
  // OG görseli ve favicon için format korunur; WebP'yi bazı platformlar
  // (ör. sosyal medya önizlemeleri) desteklemez.
  format?: "webp" | "original";
  maxDimension?: number;
};

type PreparedImage = { buffer: Buffer; extension: string; mimeType: string };

// sharp başarısız olursa (bozuk dosya vb.) orijinali olduğu gibi saklarız;
// yükleme akışı hiçbir zaman bu yüzden kırılmaz.
async function prepareImage(
  input: Buffer,
  extension: string,
  mimeType: string,
  options: SaveImageOptions,
): Promise<PreparedImage> {
  const maxDimension = options.maxDimension ?? MAX_DIMENSION;
  try {
    const pipeline = sharp(input)
      .rotate()
      .resize({
        width: maxDimension,
        height: maxDimension,
        fit: "inside",
        withoutEnlargement: true,
      });

    if (options.format === "original") {
      // Kaynak formatı açıkça korunur (OG görseli/favicon gibi durumlarda
      // WebP'ye çevirmek istemeyiz).
      const buffer =
        extension === "png"
          ? await pipeline.png({ compressionLevel: 9, effort: 7 }).toBuffer()
          : extension === "webp"
            ? await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer()
            : extension === "avif"
              ? await pipeline.avif({ quality: 60 }).toBuffer()
              : await pipeline
                  .jpeg({ quality: WEBP_QUALITY, mozjpeg: true })
                  .toBuffer();
      return { buffer, extension, mimeType };
    }

    const buffer = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();
    return { buffer, extension: "webp", mimeType: "image/webp" };
  } catch (error) {
    console.error("Görsel optimize edilemedi, orijinal saklanıyor:", error);
    return { buffer: input, extension, mimeType };
  }
}

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
export async function saveImage(
  file: File,
  options: SaveImageOptions = {},
): Promise<
  { ok: true; url: string; fileName: string; sizeBytes: number; mimeType: string } | { ok: false; error: string }
> {
  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return { ok: false, error: "Desteklenmeyen dosya türü (JPEG, PNG, WebP, AVIF)" };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: "Dosya boyutu en fazla 10MB olabilir" };
  }

  const input = Buffer.from(await file.arrayBuffer());
  const prepared = await prepareImage(input, extension, file.type, options);

  const baseName = slugify(file.name.replace(/\.[^.]+$/, "")) || "gorsel";
  const fileName = `${baseName}-${randomUUID().slice(0, 8)}.${prepared.extension}`;
  const url = `/api/media/${fileName}`;

  await mkdir(mediaDir(), { recursive: true });
  await writeFile(path.join(mediaDir(), fileName), prepared.buffer);

  await prisma.mediaAsset.create({
    data: {
      url,
      fileName,
      mimeType: prepared.mimeType,
      sizeBytes: prepared.buffer.length,
      refs: [],
    },
  });

  return {
    ok: true,
    url,
    fileName,
    sizeBytes: prepared.buffer.length,
    mimeType: prepared.mimeType,
  };
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
  if (assets.length === 0) return [];

  // Referans durumunu TEK sorgu grubuyla hesapla (N+1 yok).
  // Her kaynak tablodan url listesini çekip Set ile eşleştiririz.
  const urls = assets.map((a) => a.url);
  const [productImages, categories, pages, homepageRows, heroSlides] =
    await Promise.all([
      prisma.productImage.findMany({
        where: { url: { in: urls } },
        select: { url: true },
      }),
      prisma.category.findMany({
        where: { image: { in: urls } },
        select: { image: true },
      }),
      prisma.cmsPage.findMany({
        where: { content: { in: urls } },
        select: { content: true },
      }),
      prisma.homepageContent.findMany({
        select: { heroImageDesktop: true, heroImageMobile: true, storyImage: true },
      }),
      prisma.heroSlide.findMany({
        where: { imageUrl: { in: urls } },
        select: { imageUrl: true },
      }),
    ]);

  const used = new Set<string>();
  for (const img of productImages) used.add(img.url);
  for (const c of categories) if (c.image) used.add(c.image);
  // CmsPage içerikte HTML gömülü olabilir — her asset url'sini içerikte ara.
  for (const u of urls) {
    for (const p of pages) {
      if (p.content.includes(u)) {
        used.add(u);
        break;
      }
    }
  }
  for (const h of homepageRows) {
    if (h.heroImageDesktop) used.add(h.heroImageDesktop);
    if (h.heroImageMobile) used.add(h.heroImageMobile);
    if (h.storyImage) used.add(h.storyImage);
  }
  for (const s of heroSlides) used.add(s.imageUrl);

  return assets.map((asset) => ({
    ...asset,
    refCount: used.has(asset.url) ? 1 : 0,
  }));
}
