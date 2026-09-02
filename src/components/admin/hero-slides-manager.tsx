"use client";

import { useState } from "react";
import { Pencil, Plus, Star, Trash2, X } from "lucide-react";

import {
  deleteHeroSlideAction,
  saveHeroSlideAction,
  toggleHeroSlideActiveAction,
} from "@/app/admin/(panel)/content/actions";

export type HeroSlideItem = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string;
  ctaLabel: string | null;
  ctaUrl: string | null;
  sortOrder: number;
  active: boolean;
};

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring";
const labelClass = "mb-1.5 block text-xs text-muted-foreground";

export function HeroSlidesManager({
  slides,
}: {
  slides: HeroSlideItem[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      {slides.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground">
          Henüz slayt eklenmemiş. Slayt eklenince ana sayfada animasyonlu slider
          olarak gösterilir.
        </p>
      )}

      <ul className="space-y-3">
        {slides.map((slide) =>
          editingId === slide.id ? (
            <li
              key={slide.id}
              className="rounded-md border border-accent/40 bg-card p-4"
            >
              <SlideFields slide={slide} onDone={() => setEditingId(null)} />
            </li>
          ) : (
            <li
              key={slide.id}
              className="flex items-start gap-4 rounded-md border border-border bg-card p-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.imageUrl}
                alt=""
                className="h-16 w-24 shrink-0 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{slide.title}</span>
                  {!slide.active && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                      Pasif
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    #{slide.sortOrder}
                  </span>
                </div>
                {slide.subtitle && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {slide.subtitle}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <form action={toggleHeroSlideActiveAction}>
                  <input type="hidden" name="id" value={slide.id} />
                  <button
                    type="submit"
                    aria-label={slide.active ? "Pasifleştir" : "Aktifleştir"}
                    title={slide.active ? "Pasifleştir" : "Aktifleştir"}
                    className={`rounded p-1.5 transition-colors ${
                      slide.active
                        ? "text-accent hover:bg-secondary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Star className="size-3.5" />
                  </button>
                </form>
                <button
                  type="button"
                  aria-label="Düzenle"
                  onClick={() => setEditingId(slide.id)}
                  className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <Pencil className="size-3.5" />
                </button>
                <form action={deleteHeroSlideAction}>
                  <input type="hidden" name="id" value={slide.id} />
                  <button
                    type="submit"
                    aria-label="Sil"
                    className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </form>
              </div>
            </li>
          ),
        )}
      </ul>

      {adding ? (
        <div className="rounded-md border border-accent/40 bg-card p-4">
          <SlideFields slide={null} onDone={() => setAdding(false)} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
        >
          <Plus className="size-4" />
          Slayt Ekle
        </button>
      )}
    </div>
  );
}

function SlideFields({
  slide,
  onDone,
}: {
  slide: HeroSlideItem | null;
  onDone: () => void;
}) {
  const [imageUrl, setImageUrl] = useState(slide?.imageUrl ?? "");

  return (
    <form
      action={async (formData) => {
        await saveHeroSlideAction(formData);
        onDone();
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      {slide && <input type="hidden" name="id" value={slide.id} />}

      <div className="sm:col-span-2">
        <span className={labelClass}>Başlık *</span>
        <input
          name="title"
          required
          defaultValue={slide?.title ?? ""}
          className={inputClass}
        />
      </div>
      <div>
        <span className={labelClass}>Alt Başlık (üst etiket)</span>
        <input
          name="subtitle"
          defaultValue={slide?.subtitle ?? ""}
          className={inputClass}
        />
      </div>
      <div>
        <span className={labelClass}>Sıra</span>
        <input
          name="sortOrder"
          type="number"
          min="0"
          max="999"
          defaultValue={slide?.sortOrder ?? 0}
          className={inputClass}
        />
      </div>
      <div className="sm:col-span-2">
        <span className={labelClass}>Açıklama</span>
        <textarea
          name="description"
          rows={2}
          defaultValue={slide?.description ?? ""}
          className={`${inputClass} resize-y`}
        />
      </div>

      <div className="sm:col-span-2">
        <span className={labelClass}>Görsel *</span>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            name="imageUrl"
            placeholder="/api/media/... veya https://... (adres ile ekleme)"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            className={inputClass}
          />
          <input
            type="file"
            name="imageFile"
            accept="image/jpeg,image/png,image/webp,image/avif"
            aria-label="Görsel dosyası yükle"
            className="w-full text-xs text-muted-foreground file:mr-2 file:cursor-pointer file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-secondary-foreground hover:file:bg-muted"
          />
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Dosya seçerek yükleyebilir ya da görsel adresi yapıştırabilirsiniz;
          ikisi de boşsa kayıt yapılmaz.
        </p>
      </div>

      <div>
        <span className={labelClass}>CTA Yazısı</span>
        <input
          name="ctaLabel"
          defaultValue={slide?.ctaLabel ?? ""}
          className={inputClass}
        />
      </div>
      <div>
        <span className={labelClass}>CTA Hedefi</span>
        <input
          name="ctaUrl"
          placeholder="/urunler"
          defaultValue={slide?.ctaUrl ?? ""}
          className={inputClass}
        />
      </div>

      <div className="flex items-center justify-between gap-4 sm:col-span-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="active"
            defaultChecked={slide?.active ?? true}
            className="size-4 accent-accent"
          />
          Göster
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDone}
            aria-label="İptal"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-4 text-sm transition-colors hover:bg-muted"
          >
            <X className="size-3.5" />
            Vazgeç
          </button>
          <button
            type="submit"
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
          >
            Kaydet
          </button>
        </div>
      </div>
    </form>
  );
}
