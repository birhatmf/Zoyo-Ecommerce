import type { Metadata } from "next";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";

import { HeroInlineEditor } from "@/components/admin/hero-inline-editor";
import { HeroSlidesManager } from "@/components/admin/hero-slides-manager";
import { HomepageForm } from "@/components/admin/homepage-form";
import { saveHomepageImageAction } from "@/app/admin/(panel)/content/actions";

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="mt-1 font-heading text-xl font-medium">Ana Sayfa İçeriği</h1>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          <ExternalLink className="size-3.5" />
          Sitede görüntüle
        </Link>
      </div>

      {/* Canlı hero + slider önizleme */}
      <div className="mt-6">
        <HeroInlineEditor
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
          content={{
            heroTitle: content?.heroTitle ?? "",
            heroSubtitle: content?.heroSubtitle ?? "",
            heroDescription: content?.heroDescription ?? "",
            heroCtaLabel: content?.heroCtaLabel ?? "",
            heroCtaUrl: content?.heroCtaUrl ?? "",
            heroCtaSecondaryLabel: content?.heroCtaSecondaryLabel ?? "",
            heroCtaSecondaryUrl: content?.heroCtaSecondaryUrl ?? "",
            storyTitle: content?.storyTitle ?? "",
            storyDescription: content?.storyDescription ?? "",
            customProductionTitle: content?.customProductionTitle ?? "",
            customProductionDescription: content?.customProductionDescription ?? "",
            customProductionButtonLabel: content?.customProductionButtonLabel ?? "",
          }}
        />
      </div>

      {/* Hero slider slayt yönetimi (ekle/sil/sırala/aktif) */}
      <section className="mt-6 rounded-md border border-border bg-card p-5">
        <h2 className="text-sm font-medium">Hero Slider Slaytları (Yönetim)</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Slayt ekleme, silme, sıralama ve aktif/pasif yönetimi buradan yapılır.
          Metinleri yukarıdaki canlı önizlemeden düzenleyebilirsiniz.
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

      {/* Klasik hero + hikâye + CTA detay formu (görsel yükleme dahil) */}
      <section className="mt-6">
        <h2 className="font-heading text-lg font-medium">Detay Düzenleme</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Görsel yükleme, hizalama, görünürlük ve diğer tüm alanlar buradan yönetilir.
        </p>
        <div className="mt-4">
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
      </section>
    </div>
  );
}
