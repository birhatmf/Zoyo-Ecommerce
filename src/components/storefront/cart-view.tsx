"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Minus, Plus, Trash2 } from "lucide-react";

import { removeFromCart, setQuantity, useCartStorageWarning } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import type { StorefrontTextKey } from "@/lib/storefront-text";
import {
  effectivePrice,
  useCartProducts,
  type CartProduct,
} from "@/lib/use-cart-products";

export function CartView({
  texts,
}: {
  texts?: Record<StorefrontTextKey, string>;
}) {
  const { cart, products, isLoading } = useCartProducts();
  const storageWarning = useCartStorageWarning();

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const staleItems = isLoading ? [] : cart.filter((item) => !productMap.has(item.productId));
  const activeItems = isLoading ? [] : cart.filter((item) => productMap.has(item.productId));

  const total = activeItems.reduce((sum, item) => {
    const product = productMap.get(item.productId);
    return product ? sum + effectivePrice(product) * item.quantity : sum;
  }, 0);

  if (cart.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="font-heading text-2xl font-medium">{texts?.["cart.emptyTitle"] ?? "Sepetiniz boş"}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {texts?.["cart.emptyDescription"] ?? "Koleksiyonumuzdan beğendiğiniz parçaları sepete ekleyebilirsiniz."}
        </p>
        <Link
          href="/urunler"
          className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
        >
          {texts?.["cart.explore"] ?? "Ürünleri Keşfet"}
        </Link>
      </div>
    );
  }

  function renderLine(item: { productId: string; quantity: number }, product: CartProduct) {
    const price = effectivePrice(product);
    return (
      <li key={item.productId} className="flex gap-4 py-5">
        <Link
          href={`/urun/${product.slug}`}
          className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-sm bg-muted sm:w-24"
        >
          {product.imageUrl && (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="96px"
              className="object-cover"
            />
          )}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 py-0.5">
          <div className="flex items-start justify-between gap-3">
            <Link
              href={`/urun/${product.slug}`}
              className="text-sm font-medium leading-snug underline-offset-4 hover:underline"
            >
              {product.name}
            </Link>
            <button
              type="button"
              onClick={() => removeFromCart(item.productId)}
              aria-label={`${product.name} ürününü sepetten çıkar`}
              className="text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex h-9 items-center rounded-md border border-border">
              <button
                type="button"
                onClick={() => setQuantity(item.productId, item.quantity - 1)}
                aria-label="Miktarı azalt"
                className="inline-flex size-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              >
                <Minus className="size-3.5" />
              </button>
              <span aria-live="polite" className="w-7 text-center text-sm font-medium">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(item.productId, item.quantity + 1)}
                aria-label="Miktarı artır"
                className="inline-flex size-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
            <p className="text-sm">
              <span className="font-medium">{formatPrice(price * item.quantity)}</span>
              {item.quantity > 1 && (
                <span className="ml-2 text-muted-foreground">
                  ({formatPrice(price)} × {item.quantity})
                </span>
              )}
            </p>
          </div>
        </div>
      </li>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
      <div>
        {storageWarning && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2.5 rounded-md border border-amber-300/40 bg-amber-50 p-4 text-sm text-amber-900"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>
              {storageWarning.reason === "quota"
                ? "Tarayıcı depolama alanı dolu. Sepetiniz yalnızca bu oturum boyunca saklanacak; sayfa yenilenirse kaybolabilir."
                : "Tarayıcınız sepeti kalıcı olarak saklamıyor (gizli mod vb.). Sepetiniz yalnızca bu oturum boyunca saklanacak."}
            </span>
          </div>
        )}
        <ul className="divide-y divide-border border-y border-border">
          {activeItems.map((item) => renderLine(item, productMap.get(item.productId)!))}
        </ul>

        {staleItems.length > 0 && (
          <div className="mt-4 rounded-sm border border-border bg-secondary/60 p-4 text-sm">
            <p className="text-muted-foreground">
              Sepetinizdeki bazı ürünler artık mevcut değil.
            </p>
            <ul className="mt-2 space-y-1">
              {staleItems.map((item) => (
                <li key={item.productId} className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Ürün kaldırılmalı</span>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId)}
                    className="text-xs font-medium text-accent underline-offset-4 hover:underline"
                  >
                    Sepetten Çıkar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <aside className="lg:border-l lg:border-border lg:pl-10">
        <h2 className="font-heading text-lg font-medium">{texts?.["checkout.summary"] ?? "Sipariş Özeti"}</h2>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">{texts?.["cart.subtotal"] ?? "Ara Toplam"}</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">{texts?.["cart.delivery"] ?? "Teslimat"}</dt>
            <dd>{texts?.["cart.deliveryNote"] ?? "Üretim sonrası belirtilir"}</dd>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3 text-base font-medium">
            <dt>{texts?.["cart.total"] ?? "Toplam"}</dt>
            <dd className="font-heading text-xl">{formatPrice(total)}</dd>
          </div>
        </dl>
        <Link
          href="/siparis"
          aria-disabled={isLoading || total === 0}
          className={`mt-6 inline-flex h-11 w-full items-center justify-center rounded-md text-sm font-medium transition-colors ${
            isLoading || total === 0
              ? "pointer-events-none bg-primary/50 text-primary-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/85"
          }`}
        >
          {texts?.["cart.checkout"] ?? "Siparişi Tamamla"}
        </Link>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {texts?.["cart.noOnlinePayment"] ?? "Online ödeme alınmamaktadır. Sipariş talebiniz firma tarafından onaylandıktan sonra sizinle iletişime geçilir."}
        </p>
      </aside>
    </div>
  );
}
