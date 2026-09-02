"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { deleteMediaIfUnused } from "@/lib/storage";

const deleteSchema = z.object({ id: z.string().uuid() });

// Güvenli silme: yalnızca referansı olmayan medya fiziksel olarak silinir.
// Referans varsa DB kaydı korunur (silinmez), böylece yetim/bozuk dosya oluşmaz.
export async function deleteMediaAssetAction(formData: FormData): Promise<void> {
  const admin = await requireRole("ADMIN");
  if (!admin) return;

  const parsed = deleteSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return;

  const asset = await prisma.mediaAsset.findUnique({
    where: { id: parsed.data.id },
    select: { fileName: true, url: true },
  });
  if (!asset) return;

  // Referans kontrolü: URL herhangi bir varlıkta kullanılıyorsa silme.
  const [productRef, categoryRef, pageRef, homepageRef, heroRef] = await Promise.all([
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

  const inUse = productRef + categoryRef + pageRef + homepageRef + heroRef > 0;
  if (inUse) return;

  await deleteMediaIfUnused(asset.fileName);
  await recordAudit({
    actor: admin,
    action: "DELETE",
    entityType: "MediaAsset",
    entityId: parsed.data.id,
    summary: `${asset.fileName} medyası silindi`,
  });
  revalidatePath("/admin/media");
}
