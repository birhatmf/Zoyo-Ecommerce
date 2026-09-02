import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type SiteSettings = Record<string, string>;

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const rows = await prisma.siteSetting.findMany();
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
});

export async function getSetting(
  key: string,
  fallback = "",
): Promise<string> {
  const settings = await getSiteSettings();
  return settings[key] || fallback;
}
