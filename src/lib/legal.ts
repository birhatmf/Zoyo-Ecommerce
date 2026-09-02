import "server-only";

import { prisma } from "@/lib/prisma";

// Yasal metin kabul anında hangi versiyon geçerliydi? KVKK uyumu için
// sayfanın updatedAt'i + slug + title bilgisi snapshot olarak kaydedilir.
// Aktif olmayan sayfalar dahil edilmez çünkü müşteri onlara tıklayamaz.
const LEGAL_SLUGS = [
  "kvkk",
  "gizlilik-politikasi",
  "mesafeli-satis-sozlesmesi",
] as const;

export type LegalSnapshot = {
  slug: (typeof LEGAL_SLUGS)[number];
  title: string;
  version: string; // updatedAt ISO
};

export async function getActiveLegalSnapshot(): Promise<LegalSnapshot[]> {
  const pages = await prisma.cmsPage.findMany({
    where: {
      slug: { in: [...LEGAL_SLUGS] },
      active: true,
    },
    select: { slug: true, title: true, updatedAt: true },
  });
  return pages.map((page) => ({
    slug: page.slug as LegalSnapshot["slug"],
    title: page.title,
    version: page.updatedAt.toISOString(),
  }));
}