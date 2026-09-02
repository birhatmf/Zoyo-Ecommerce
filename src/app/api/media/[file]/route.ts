import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { getMediaContentType, mediaDir } from "@/lib/storage";

// Yalnızca basit dosya adları kabul edilir — path traversal engellenir.
const FILE_NAME_REGEX = /^[a-z0-9-]+\.(jpg|jpeg|png|webp|avif)$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  if (!FILE_NAME_REGEX.test(file)) {
    return NextResponse.json({ error: "Geçersiz dosya" }, { status: 400 });
  }

  const contentType = getMediaContentType(file);
  if (!contentType) {
    return NextResponse.json({ error: "Desteklenmeyen tür" }, { status: 400 });
  }

  try {
    const data = await readFile(path.join(mediaDir(), file));
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }
}
