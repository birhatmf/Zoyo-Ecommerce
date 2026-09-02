"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import {
  saveCategoryAction,
  type CategoryActionState,
} from "@/app/admin/(panel)/categories/actions";
import { slugify } from "@/lib/slugify";

export type CategoryFormDefaults = {
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  active?: boolean;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
};

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring";

export function CategoryForm({ defaults = {} }: { defaults?: CategoryFormDefaults }) {
  const [state, formAction, isPending] = useActionState<CategoryActionState, FormData>(
    saveCategoryAction,
    {},
  );
  const [slug, setSlug] = useState(defaults.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaults.slug));

  const fieldError = (name: string) => state?.fieldErrors?.[name];

  return (
    <form action={formAction} className="max-w-xl">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}

      {state?.error && (
        <p role="alert" className="mb-5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="space-y-4">
        <div>
          <span className="mb-1.5 block text-sm text-muted-foreground">Kategori Adı *</span>
          <input
            name="name"
            required
            defaultValue={defaults.name}
            onChange={(event) => {
              if (!slugTouched) setSlug(slugify(event.target.value));
            }}
            className={inputClass}
          />
          {fieldError("name") && (
            <span className="mt-1 block text-xs text-destructive">{fieldError("name")}</span>
          )}
        </div>
        <div>
          <span className="mb-1.5 block text-sm text-muted-foreground">Slug *</span>
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
          <span className="mt-1 block text-xs text-muted-foreground/80">
            /kategori/{slug || "{slug}"} adresinde kullanılır
          </span>
          {fieldError("slug") && (
            <span className="mt-1 block text-xs text-destructive">{fieldError("slug")}</span>
          )}
        </div>
        <div>
          <span className="mb-1.5 block text-sm text-muted-foreground">Açıklama</span>
          <textarea name="description" rows={3} defaultValue={defaults.description} className={`${inputClass} resize-y`} />
        </div>
        <div>
          <span className="mb-1.5 block text-sm text-muted-foreground">Görsel URL</span>
          <input
            name="image"
            type="url"
            defaultValue={defaults.image}
            placeholder="/uploads/... veya https://..."
            className={inputClass}
          />
          {fieldError("image") && (
            <span className="mt-1 block text-xs text-destructive">{fieldError("image")}</span>
          )}
        </div>
        <div>
          <span className="mb-1.5 block text-sm text-muted-foreground">Sıralama</span>
          <input
            name="sortOrder"
            type="number"
            min="0"
            max="999"
            defaultValue={defaults.sortOrder ?? 0}
            className={`${inputClass} w-24`}
          />
          {fieldError("sortOrder") && (
            <span className="mt-1 block text-xs text-destructive">{fieldError("sortOrder")}</span>
          )}
        </div>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" name="active" defaultChecked={defaults.active ?? true} className="size-4 accent-accent" />
          Yayında
        </label>
        <div>
          <span className="mb-1.5 block text-sm text-muted-foreground">SEO Başlığı</span>
          <input
            name="seoTitle"
            maxLength={70}
            defaultValue={defaults.seoTitle}
            placeholder="Boşsa kategori adı kullanılır"
            className={inputClass}
          />
        </div>
        <div>
          <span className="mb-1.5 block text-sm text-muted-foreground">SEO Açıklaması</span>
          <textarea
            name="seoDescription"
            rows={2}
            maxLength={200}
            defaultValue={defaults.seoDescription}
            placeholder="Boşsa kategori açıklaması kullanılır"
            className={`${inputClass} resize-y`}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="h-10 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50"
        >
          {isPending ? "Kaydediliyor..." : "Kaydet"}
        </button>
        <Link
          href="/admin/categories"
          className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Vazgeç
        </Link>
      </div>
    </form>
  );
}
