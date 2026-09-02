import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MessageCircle } from "lucide-react";

import { AddToCart } from "@/components/storefront/add-to-cart";
import { MobileActionBar } from "@/components/storefront/mobile-action-bar";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { formatPrice, whatsappUrl } from "@/lib/format";
import { getSiteSettings } from "@/lib/settings";
import { safeJsonLd } from "@/lib/utils";
import { getProductBySlug } from "@/services/catalog.service";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Ürün Bulunamadı" };
  const title = product.seoTitle || product.name;
  const description = product.seoDescription || product.shortDescription || undefined;
  const cover = product.images.find((i) => i.isCover) ?? product.images[0];
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(cover ? { images: [{ url: cover.url }] } : {}),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getSiteSettings(),
  ]);
  if (!product) notFound();

  const discountPrice =
    product.discountPrice !== null &&
    Number(product.discountPrice) > 0 &&
    Number(product.discountPrice) < Number(product.price)
      ? product.discountPrice
      : null;

  const waLink = settings.whatsapp
    ? whatsappUrl(
        settings.whatsapp,
        `Merhaba,\n\n${product.name}\nÜrün Kodu: ${product.productCode}\n\nürünü hakkında bilgi almak istiyorum.`,
      )
    : null;

  const specs = [
    { label: "Ürün Kodu", value: product.productCode },
    { label: "Malzeme", value: product.material },
    { label: "Ölçüler", value: product.dimensions },
    { label: "Üretim Süresi", value: product.productionTime },
    { label: "Teslimat", value: product.deliveryInformation },
    {
      label: "Kategori",
      value: product.category?.name,
      href: product.category
        ? `/kategori/${product.category.slug}`
        : undefined,
    },
  ].filter((spec) => spec.value);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.productCode,
    description: product.shortDescription ?? product.description ?? undefined,
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      price: Number(discountPrice ?? product.price).toFixed(2),
      priceCurrency: settings.currency || "TRY",
      availability: "https://schema.org/InStock",
      ...(siteUrl ? { url: `${siteUrl}/urun/${product.slug}` } : {}),
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 pb-28 sm:px-6 md:py-14 lg:pb-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      {/* Mobil sabit eylem çubuğu */}
      <MobileActionBar productId={product.id} waLink={waLink} />
      <nav
        aria-label="Konum"
        className="flex items-center gap-1.5 text-xs text-muted-foreground"
      >
        <Link href="/" className="shrink-0 transition-colors hover:text-foreground">
          Ana Sayfa
        </Link>
        <ChevronRight className="size-3 shrink-0" />
        <Link href="/urunler" className="shrink-0 transition-colors hover:text-foreground">
          Ürünler
        </Link>
        <ChevronRight className="size-3 shrink-0" />
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <ProductGallery
          images={product.images.map((image) => ({
            id: image.id,
            url: image.url,
            altText: image.altText,
          }))}
          productName={product.name}
        />

        <div>
          {product.category && (
            <Link
              href={`/kategori/${product.category.slug}`}
              className="text-xs font-medium tracking-[0.2em] text-accent uppercase transition-opacity hover:opacity-80"
            >
              {product.category.name}
            </Link>
          )}
          <h1 className="mt-2 font-heading text-3xl leading-tight font-medium text-balance sm:text-4xl">
            {product.name}
          </h1>
          {product.shortDescription && (
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {product.shortDescription}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            {discountPrice ? (
              <>
                <span className="font-heading text-3xl font-medium text-accent">
                  {formatPrice(discountPrice)}
                </span>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                  İndirimli
                </span>
              </>
            ) : (
              <span className="font-heading text-3xl font-medium">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {specs.length > 0 && (
            <dl className="mt-8 divide-y divide-border border-y border-border text-sm">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="grid grid-cols-[110px_1fr] gap-4 py-3 sm:grid-cols-[140px_1fr]"
                >
                  <dt className="text-muted-foreground">{spec.label}</dt>
                  <dd className="min-w-0 break-words font-medium">
                    {spec.href ? (
                      <Link href={spec.href} className="underline-offset-4 hover:underline">
                        {spec.value}
                      </Link>
                    ) : (
                      spec.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-8">
            <AddToCart productId={product.id} />
          </div>

          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-border text-sm font-medium transition-colors hover:bg-muted sm:w-auto sm:px-10"
            >
              <MessageCircle className="size-4" />
              WhatsApp&apos;tan Bilgi Al
            </a>
          )}

          {product.description && (
            <div className="mt-10 border-t border-border pt-8">
              <h2 className="font-heading text-lg font-medium">Ürün Hakkında</h2>
              <p className="mt-3 leading-relaxed whitespace-pre-line text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
