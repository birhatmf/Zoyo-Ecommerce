import type { Metadata } from "next";

import Link from "next/link";
import { prisma } from "@/lib/prisma";

import { saveHomepageImageAction } from "@/app/admin/(panel)/content/actions";
import { HeroSlidesManager } from "@/components/admin/hero-slides-manager";
import { HomepageForm } from "@/components/admin/homepage-form";

export const metadata: Metadata = { title: "Ana Sayfa İçeriği" };

export default async function AdminHomeContentPage() {
  const [content, slides] = await Promise.all([
    prisma.homepageContent.findUnique({ where: { id: "homepage" } }),
    prisma.heroSlide.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  return (
    <div>
      <Link
        href="/admin/content"
        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        ← İçerik
      </Link>
      <h1 className="mt-1 font-heading text-xl font-medium">Ana Sayfa İçeriği</h1>
      <div className="mt-6">
        <HomepageForm
          uploadImageAction={saveHomepageImageAction}
          defaults={{
            heroTitle: content?.heroTitle ?? "",
            heroSubtitle: content?.heroSubtitle ?? "",
            heroDescription: content?.heroDescription ?? "",
            heroImageDesktop: content?.heroImageDesktop ?? "",
            heroImageMobile: content?.heroImageMobile ?? "",
            heroCtaLabel: content?.heroCtaLabel ?? "",
            heroCtaUrl: content?.heroCtaUrl ?? "",
            heroCtaSecondaryLabel: content?.heroCtaSecondaryLabel ?? "",
            heroCtaSecondaryUrl: content?.heroCtaSecondaryUrl ?? "",
            heroAlignment: content?.heroAlignment ?? "left",
            heroActive: content?.heroActive ?? true,
            storyTitle: content?.storyTitle ?? "",
            storyDescription: content?.storyDescription ?? "",
            storyImage: content?.storyImage ?? "",
            customProductionTitle: content?.customProductionTitle ?? "",
            customProductionDescription:
              content?.customProductionDescription ?? "",
            customProductionButtonLabel:
              content?.customProductionButtonLabel ?? "",
          }}
        />
      </div>

      {/* Hero slider slaytları */}
      <section className="mt-6 rounded-md border border-border bg-card p-5">
        <h2 className="text-sm font-medium">Hero Slider Slaytları</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Slayt eklendiğinde ana sayfa hero bölümü tam ekran animasyonlu slider&apos;a
          dönüşür. Slayt yoksa yukarıdaki klasik hero gösterilir.
        </p>
        <div className="mt-4">
          <HeroSlidesManager
            slides={slides.map((slide) => ({
              id: slide.id,
              title: slide.title,
              subtitle: slide.subtitle,
              description: slide.description,
              imageUrl: slide.imageUrl,
              ctaLabel: slide.ctaLabel,
              ctaUrl: slide.ctaUrl,
              sortOrder: slide.sortOrder,
              active: slide.active,
            }))}
          />
        </div>
      </section>
    </div>
  );
}
