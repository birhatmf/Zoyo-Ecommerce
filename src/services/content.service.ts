import "server-only";

import { cache } from "react";
import { prisma } from "@/lib/prisma";

export async function getHomepageContent() {
  return prisma.homepageContent.findUnique({ where: { id: "homepage" } });
}

// Layout ile sayfa aynı istekte tek sorguyu paylaşır
export const getActiveHeroSlides = cache(async () => {
  return prisma.heroSlide.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
});

export async function getHeaderLinks() {
  return prisma.headerLink.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getFooterLinkGroups() {
  return prisma.footerLinkGroup.findMany({
    orderBy: { sortOrder: "asc" },
    include: { links: { orderBy: { sortOrder: "asc" } } },
  });
}
