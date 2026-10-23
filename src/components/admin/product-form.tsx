"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { saveProductAction, type ActionState } from "@/app/admin/(panel)/products/actions";
import {
  ProductImagesField,
  type ProductImageInput,
} from "@/components/admin/product-images-field";
import { slugify } from "@/lib/slugify";

type CategoryOption = { id: string; name: string };

export type ProductFormDefaults = {
  id?: string;
  name?: string;
  slug?: string;
  productCode?: string;
  shortDescription?: string;
  description?: string;
  price?: string;
  discountPrice?: string;
  categoryIds?: string[];
  material?: string;
  dimensions?: string;
  productionTime?: string;
  deliveryInformation?: string;
  status?: "DRAFT" | "ACTIVE" | "INACTIVE";
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
};

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring";

export function ProductForm({
  categories,
  defaults = {},
  images = [],
}: {
  categories: CategoryOption[];
  defaults?: ProductFormDefaults;
  images?: ProductImageInput[];
}) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    saveProductAction,
    {},
  );
  const [slug, setSlug] = useState(defaults.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaults.slug));

  const fieldError = (name: string) => state?.fieldErrors?.[name];

  return (
    <form action={formAction} className="max-w-3xl">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}

      {state?.error && (
        <p role="alert" className="mb-6 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <section className="rounded-md border border-border bg-card p-5">
        <ProductImagesField initialImages={images} productName={defaults.name} />
      </section>

      <section className="mt-6 rounded-md border border-border bg-card p-5">
        <h2 className="mb-6 text-sm font-medium">Ürün Bilgileri</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Ürün Adı *" error={fieldError("name")} className="sm:col-span-2">
            <input
              name="name"
              required
              defaultValue={defaults.name}
              onChange={(event) => {
                if (!slugTouched) setSlug(slugify(event.target.value));
              }}
              className={inputClass}
            />
          </Field>
          <Field label="Slug *" error={fieldError("slug")} hint="/urun/{slug} adresinde kullanılır">
            <input
              name="slug"
              required
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              className={inputClass}
            />
          </Field>
          <Field label="Ürün Kodu *" error={fieldError("productCode")}>
            <input name="productCode" required defaultValue={defaults.productCode} className={inputClass} />
          </Field>
          <Field label="Fiyat (₺) *" error={fieldError("price")}>
            <input
              name="price"
              required
              type="number"
              step="0.01"
              min="0"
              defaultValue={defaults.price}
              className={inputClass}
            />
          </Field>
          <Field label="İndirimli Fiyat (₺)" error={fieldError("discountPrice")} hint="Boş bırakılırsa indirim uygulanmaz">
            <input
              name="discountPrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={defaults.discountPrice}
              className={inputClass}
            />
          </Field>
          <Field label="Kategoriler" error={fieldError("categoryIds")} className="sm:col-span-2">
            {categories.length === 0 ? (
              <span className="text-xs text-muted-foreground">Henüz kategori eklenmemiş.</span>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="categoryIds"
                      value={category.id}
                      defaultChecked={defaults.categoryIds?.includes(category.id)}
                      className="size-4 accent-accent"
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            )}
          </Field>
          <Field label="Durum" error={fieldError("status")}>
            <select name="status" defaultValue={defaults.status ?? "DRAFT"} className={inputClass}>
              <option value="DRAFT">Taslak</option>
              <option value="ACTIVE">Yayında</option>
              <option value="INACTIVE">Pasif</option>
            </select>
          </Field>
          <Field label="Kısa Açıklama" error={fieldError("shortDescription")} className="sm:col-span-2">
            <textarea name="shortDescription" rows={2} defaultValue={defaults.shortDescription} className={`${inputClass} resize-y`} />
          </Field>
          <Field label="Açıklama" error={fieldError("description")} className="sm:col-span-2">
            <textarea name="description" rows={5} defaultValue={defaults.description} className={`${inputClass} resize-y`} />
          </Field>
          <Field label="Malzeme" error={fieldError("material")}>
            <input name="material" defaultValue={defaults.material} className={inputClass} />
          </Field>
          <Field label="Ölçüler" error={fieldError("dimensions")}>
            <input name="dimensions" placeholder="220 x 70 x 75 cm" defaultValue={defaults.dimensions} className={inputClass} />
          </Field>
          <Field label="Üretim Süresi" error={fieldError("productionTime")}>
            <input name="productionTime" placeholder="10-15 iş günü" defaultValue={defaults.productionTime} className={inputClass} />
          </Field>
          <Field label="Teslimat Bilgisi" error={fieldError("deliveryInformation")}>
            <input name="deliveryInformation" defaultValue={defaults.deliveryInformation} className={inputClass} />
          </Field>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm sm:col-span-2">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={defaults.featured}
              className="size-4 accent-accent"
            />
            Ana sayfada öne çıkar
          </label>

          <Field
            label="SEO Başlığı"
            error={fieldError("seoTitle")}
            hint="Boş bırakılırsa ürün adı kullanılır (max 70 karakter)"
            className="sm:col-span-2"
          >
            <input name="seoTitle" maxLength={70} defaultValue={defaults.seoTitle} className={inputClass} />
          </Field>
          <Field
            label="SEO Açıklaması"
            error={fieldError("seoDescription")}
            hint="Boş bırakılırsa kısa açıklama kullanılır (max 200 karakter)"
            className="sm:col-span-2"
          >
            <textarea
              name="seoDescription"
              rows={2}
              maxLength={200}
              defaultValue={defaults.seoDescription}
              className={`${inputClass} resize-y`}
            />
          </Field>
        </div>
      </section>

      <div className="mt-8 flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="h-10 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50"
        >
          {isPending ? "Kaydediliyor..." : "Kaydet"}
        </button>
        <Link
          href="/admin/products"
          className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Vazgeç
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <span className="mb-1.5 block text-sm text-muted-foreground">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted-foreground/80">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </div>
  );
}
