import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

import { ProductCard } from "@/components/storefront/product-card";
import { HeroSlider } from "@/components/storefront/hero-slider";
import { SmartImage } from "@/components/storefront/smart-image";
import { whatsappUrl } from "@/lib/format";
import { toProductCardData } from "@/lib/product";
import { getSiteSettings } from "@/lib/settings";
import { getStorefrontTexts } from "@/lib/storefront-text";
import {
  getActiveCategories,
  getFeaturedProducts,
} from "@/services/catalog.service";
import {
  getActiveHeroSlides,
  getHomepageContent,
} from "@/services/content.service";

export default async function HomePage() {
  const [content, categories, featured, settings, slides, texts] = await Promise.all([
    getHomepageContent(),
    getActiveCategories(),
    getFeaturedProducts(),
    getSiteSettings(),
    getActiveHeroSlides(),
    getStorefrontTexts(),
  ]);

  const waLink = settings.whatsapp
    ? whatsappUrl(
        settings.whatsapp,
        "Merhaba, özel üretim bir proje hakkında görüşmek istiyorum.",
      )
    : null;

  return (
    <>
      {/* Hero — slider varsa heroActive'ten bağımsız gösterilir;
          heroActive yalnızca klasik hero bölümünü kontrol eder */}
      {slides.length > 0 ? (
        <div className="-mt-16">
          <HeroSlider
            slides={slides.map((slide) => ({
              id: slide.id,
              title: slide.title,
              subtitle: slide.subtitle,
              description: slide.description,
              imageUrl: slide.imageUrl,
              ctaLabel: slide.ctaLabel,
              ctaUrl: slide.ctaUrl,
            }))}
          />
        </div>
      ) : (
        content?.heroActive !== false && (
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:gap-16">
            <div
              className={
                content?.heroAlignment === "center"
                  ? "text-center md:col-span-2"
                  : ""
              }
            >
              {content?.heroSubtitle && (
                <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">
                  {content.heroSubtitle}
                </p>
              )}
              <h1 className="mt-4 font-heading text-4xl leading-tight font-medium text-balance sm:text-5xl">
                {content?.heroTitle || "Doğal Ahşabın Zamansız Formu"}
              </h1>
              {(content?.heroDescription || settings.siteDescription) && (
                <p className="mt-5 max-w-lg leading-relaxed text-muted-foreground">
                  {content?.heroDescription || settings.siteDescription}
                </p>
              )}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {content?.heroCtaLabel && content.heroCtaUrl && (
                  <Link
                    href={content.heroCtaUrl}
                    className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
                  >
                    {content.heroCtaLabel}
                    <ArrowRight className="size-4" />
                  </Link>
                )}
                {content?.heroCtaSecondaryLabel && content.heroCtaSecondaryUrl && (
                  <Link
                    href={content.heroCtaSecondaryUrl}
                    className="inline-flex h-11 items-center rounded-md border border-border px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {content.heroCtaSecondaryLabel}
                  </Link>
                )}
              </div>
            </div>
            {(content?.heroImageDesktop || content?.heroImageMobile) && (
              <div className="relative hidden aspect-[4/3] overflow-hidden rounded-md bg-muted lg:block">
                <SmartImage
                  src={content.heroImageDesktop}
                  alt={content.heroTitle || ""}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
            )}
          </div>
        </section>
        )
      )}

      {/* Kategoriler */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <SectionHeading title={texts["homepage.categoriesHeading"]} href="/urunler" linkLabel={texts["homepage.viewAll"]} />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link key={category.id} href={`/kategori/${category.slug}`} className="group block">
                <div className="relative aspect-[5/4] overflow-hidden rounded-md bg-muted">
                  <SmartImage
                    src={category.image}
                    alt={category.name}
                    fallbackLabel={category.name}
                    className="transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <h3 className="mt-3.5 font-heading text-base font-medium">{category.name}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Öne Çıkan Ürünler */}
      {featured.length > 0 && (
        <section className="border-y border-border bg-secondary/50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
            <SectionHeading title={texts["homepage.featuredHeading"]} href="/urunler" linkLabel={texts["homepage.allProducts"]} />
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard
                  key={product.id}
                  product={toProductCardData(product)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Marka / üretim hikâyesi */}
      {(content?.storyTitle || content?.storyDescription) && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {content.storyImage && (
              <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-muted">
                <SmartImage
                  src={content.storyImage}
                  alt={content.storyTitle || ""}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
            )}
            <div className={content.storyImage ? "" : "lg:col-span-2"}>
              <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">
                {texts["homepage.storyHeading"]}
              </p>
              <h2 className="mt-4 font-heading text-3xl font-medium sm:text-4xl">
                {content.storyTitle}
              </h2>
              <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
                {content.storyDescription}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Özel üretim CTA */}
      {(content?.customProductionTitle || waLink) && (
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 md:py-20">
            <h2 className="font-heading text-3xl font-medium sm:text-4xl">
              {content?.customProductionTitle || "Özel Üretim Projeleriniz İçin"}
            </h2>
            {content?.customProductionDescription && (
              <p className="mx-auto mt-4 max-w-xl leading-relaxed text-primary-foreground/70">
                {content.customProductionDescription}
              </p>
            )}
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex h-11 items-center gap-2 rounded-md bg-accent px-6 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
              >
                <MessageCircle className="size-4" />
                {content?.customProductionButtonLabel || "WhatsApp'tan Yazın"}
              </a>
            )}
          </div>
        </section>
      )}
    </>
  );
}

function SectionHeading({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="font-heading text-2xl font-medium sm:text-3xl">{title}</h2>
      <Link
        href={href}
        className="group inline-flex items-center gap-1.5 pb-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {linkLabel}
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
