"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import {
  saveCmsPageAction,
  type CmsActionState,
} from "@/app/admin/(panel)/content/actions";
import { slugify } from "@/lib/slugify";

export type CmsPageFormDefaults = {
  id?: string;
  title?: string;
  slug?: string;
  type?: "LEGAL" | "CORPORATE" | "CUSTOM";
  content?: string;
  active?: boolean;
};

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring";

export function CmsPageForm({ defaults = {} }: { defaults?: CmsPageFormDefaults }) {
  const [state, formAction, isPending] = useActionState<CmsActionState, FormData>(
    saveCmsPageAction,
    {},
  );
  const [slug, setSlug] = useState(defaults.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaults.slug));

  const fieldError = (name: string) => state?.fieldErrors?.[name];

  return (
    <form action={formAction} className="max-w-3xl">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}

      {state?.error && (
        <p role="alert" className="mb-5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className="mb-1.5 block text-sm text-muted-foreground">Başlık *</span>
          <input
            name="title"
            required
            defaultValue={defaults.title}
            onChange={(event) => {
              if (!slugTouched) setSlug(slugify(event.target.value));
            }}
            className={inputClass}
          />
          {fieldError("title") && (
            <span className="mt-1 block text-xs text-destructive">{fieldError("title")}</span>
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
          {fieldError("slug") && (
            <span className="mt-1 block text-xs text-destructive">{fieldError("slug")}</span>
          )}
        </div>
        <div>
          <span className="mb-1.5 block text-sm text-muted-foreground">Tür</span>
          <select name="type" defaultValue={defaults.type ?? "CUSTOM"} className={inputClass}>
            <option value="LEGAL">Yasal</option>
            <option value="CORPORATE">Kurumsal</option>
            <option value="CUSTOM">Özel</option>
          </select>
        </div>
        <label className="flex cursor-pointer items-end gap-2.5 pb-2.5 text-sm">
          <input type="checkbox" name="active" defaultChecked={defaults.active ?? true} className="size-4 accent-accent" />
          Yayında
        </label>
        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-sm text-muted-foreground">İçerik</span>
          <textarea
            name="content"
            rows={16}
            defaultValue={defaults.content}
            placeholder="<p>Paragraf…</p><ul><li>Liste öğesi</li></ul>"
            className={`${inputClass} resize-y font-mono text-xs leading-relaxed`}
          />
          <span className="mt-1 block text-xs text-muted-foreground/80">
            Temel HTML etiketleri kullanılabilir: p, strong, em, h2-h4, ul, ol, li, a.
            Güvenlik için diğer etiketler render sırasında temizlenir.
          </span>
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
          href="/admin/content/pages"
          className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Vazgeç
        </Link>
      </div>
    </form>
  );
}
