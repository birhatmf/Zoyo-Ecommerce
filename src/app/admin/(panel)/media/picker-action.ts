"use server";

import "server-only";

import { requireRole } from "@/lib/auth";
import { listMediaAssets } from "@/lib/storage";

// Medya seçici dialog'u için kullanılabilir görselleri döndürür (ADMIN/EDITOR).
export async function listMediaForPickerAction(): Promise<
  { id: string; url: string; fileName: string }[]
> {
  const admin = await requireRole("EDITOR");
  if (!admin) return [];

  const assets = await listMediaAssets();
  return assets.map((a) => ({ id: a.id, url: a.url, fileName: a.fileName }));
}
