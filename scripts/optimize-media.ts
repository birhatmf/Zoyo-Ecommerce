import "dotenv/config";

import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import sharp from "sharp";
import { PrismaClient } from "../src/generated/prisma/client";

// Mevcut medya dosyalarını tek seferlik optimize eder: EXIF yönü düzeltilir,
// uzun kenar MAX_DIMENSION'a indirilir, kaynak format korunarak yeniden
// kodlanır (URL'ler değişmesin diye uzantı korunur).
//
// Güvenlik: orijinaller storage/media-originals altına yedeklenir ve yalnızca
// çıktı orijinalden KÜÇÜKSE dosya değiştirilir. Idempotenttir.

const MAX_DIMENSION = 1920;
const MEDIA_DIR = path.join(process.cwd(), "storage", "media");
const BACKUP_DIR = path.join(process.cwd(), "storage", "media-originals");
const FILE_RE = /^[a-z0-9-]+\.(jpg|jpeg|png|webp|avif)$/;

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

async function optimize(input: Buffer, extension: string): Promise<Buffer> {
  const pipeline = sharp(input)
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    });

  switch (extension) {
    case "jpg":
    case "jpeg":
      return pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    case "png":
      return pipeline.png({ compressionLevel: 9, effort: 7 }).toBuffer();
    case "webp":
      return pipeline.webp({ quality: 82 }).toBuffer();
    case "avif":
      return pipeline.avif({ quality: 60 }).toBuffer();
    default:
      throw new Error(`desteklenmeyen uzantı: ${extension}`);
  }
}

async function main() {
  await mkdir(BACKUP_DIR, { recursive: true });

  const files = (await readdir(MEDIA_DIR)).filter((file) => FILE_RE.test(file));
  console.log(`${files.length} medya dosyası işlenecek\n`);

  let changed = 0;
  let skipped = 0;
  let savedBytes = 0;

  for (const file of files) {
    const fullPath = path.join(MEDIA_DIR, file);
    const before = (await stat(fullPath)).size;
    const input = await readFile(fullPath);
    const extension = file.split(".").pop()!.toLowerCase();

    let output: Buffer;
    try {
      output = await optimize(input, extension);
    } catch (error) {
      console.log(`HATA   ${file}: ${(error as Error).message}`);
      skipped += 1;
      continue;
    }

    if (output.length >= before) {
      console.log(`ATLA   ${file} (${formatBytes(before)}) — kazanç yok`);
      skipped += 1;
      continue;
    }

    // Orijinali yalnızca ilk seferde yedekle.
    const backupPath = path.join(BACKUP_DIR, file);
    try {
      await stat(backupPath);
    } catch {
      await copyFile(fullPath, backupPath);
    }

    await writeFile(fullPath, output);
    await prisma.mediaAsset.updateMany({
      where: { fileName: file },
      data: { sizeBytes: output.length },
    });

    savedBytes += before - output.length;
    changed += 1;
    console.log(
      `OK     ${file}: ${formatBytes(before)} -> ${formatBytes(output.length)}`,
    );
  }

  console.log(
    `\nToplam: ${changed} optimize edildi, ${skipped} atlandı, kazanç ${formatBytes(savedBytes)}`,
  );
  console.log(`Orijinaller: ${BACKUP_DIR}`);
  await prisma.$disconnect();
}

main();
