"use client";

import { useActionState } from "react";

import { MediaUploadButton } from "@/components/admin/media-upload-button";
import {
  saveHomepageAction,
  type CmsActionState,
} from "@/app/admin/(panel)/content/actions";

// Ana sayfa yapısal ayarları: görsel yükleme (anında kaydedilir) + görünürlük
// ve hizalama. Metinler canlı önizlemede (HeroInlineEditor) düzenlendiği için
// burada tekrar edilmez. Submit sırasında mevcut metinler gizli alanlarla
// korunur (saveHomepageAction tüm alanı upsert eder).
export type HomepageVisualDefaults = {
  heroImageDesktop: string;
  heroImageMobile: string;
  heroAlignment: string;
  heroActive: boolean;
  storyImage: string;
  // Metin alanları: submit'te ezilmemesi için taşınır
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroCtaLabel: string;
  heroCtaUrl: string;
  heroCtaSecondaryLabel: string;
  heroCtaSecondaryUrl: string;
  storyTitle: string;
  storyDescription: string;
  customProductionTitle: string;
  customProductionDescription: string;
  customProductionButtonLabel: string;
};

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring";
const labelClass = "mb-1.5 block text-sm text-muted-foreground";

export function HomepageVisualForm({
  defaults,
  uploadImageAction,
}: {
  defaults: HomepageVisualDefaults;
  uploadImageAction?: (formData: FormData) => Promise<void>;
}) {
  const [state, formAction, isPending] = useActionState<CmsActionState, FormData>(
    saveHomepageAction,
    {},
  );

  const mediaField = (name: string, label: string) => (
    <div>
      <span className={labelClass}>{label}</span>
      <div className="flex items-center gap-2">
        <div className="h-9 min-w-0 flex-1 truncate rounded-md border border-input bg-muted/50 px-3 text-sm leading-9 text-muted-foreground">
          {defaults[name as keyof HomepageVisualDefaults] || "Henüz görsel yok"}
        </div>
        {uploadImageAction && (
          <MediaUploadButton action={uploadImageAction} hiddenFields={{ field: name }} />
        )}
      </div>
    </div>
  );

  return (
    <>
      {state?.error && (
        <p role="alert" className="mb-5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <form action={formAction}>
        {/* Mevcut metinleri koru — inline editor düzenledi */}
        <input type="hidden" name="heroTitle" value={defaults.heroTitle} />
        <input type="hidden" name="heroSubtitle" value={defaults.heroSubtitle} />
        <input type="hidden" name="heroDescription" value={defaults.heroDescription} />
        <input type="hidden" name="heroCtaLabel" value={defaults.heroCtaLabel} />
        <input type="hidden" name="heroCtaUrl" value={defaults.heroCtaUrl} />
        <input
          type="hidden"
          name="heroCtaSecondaryLabel"
          value={defaults.heroCtaSecondaryLabel}
        />
        <input
          type="hidden"
          name="heroCtaSecondaryUrl"
          value={defaults.heroCtaSecondaryUrl}
        />
        <input type="hidden" name="storyTitle" value={defaults.storyTitle} />
        <input type="hidden" name="storyDescription" value={defaults.storyDescription} />
        <input
          type="hidden"
          name="customProductionTitle"
          value={defaults.customProductionTitle}
        />
        <input
          type="hidden"
          name="customProductionDescription"
          value={defaults.customProductionDescription}
        />
        <input
          type="hidden"
          name="customProductionButtonLabel"
          value={defaults.customProductionButtonLabel}
        />

        {/* Görseller (anında kaydedilir) */}
        <section className="rounded-md border border-border bg-card p-5">
          <h2 className="text-sm font-medium">Görseller</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Yüklenen görsel anında kaydedilir ve sitede kullanılır.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {mediaField("heroImageDesktop", "Hero — Masaüstü")}
            {mediaField("heroImageMobile", "Hero — Mobil")}
            <div className="sm:col-span-2 sm:max-w-sm">
              {mediaField("storyImage", "Hikâye Bölümü")}
            </div>
          </div>
        </section>

        {/* Görünürlük ve hizalama */}
        <section className="mt-6 rounded-md border border-border bg-card p-5">
          <h2 className="text-sm font-medium">Hero Görünürlüğü</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <span className={labelClass}>İçerik Hizalama</span>
              <select name="heroAlignment" defaultValue={defaults.heroAlignment} className={inputClass}>
                <option value="left">Sola</option>
                <option value="center">Ortaya (tam genişlik)</option>
              </select>
            </div>
            <label className="flex cursor-pointer items-end gap-2.5 pb-2.5 text-sm">
              <input
                type="checkbox"
                name="heroActive"
                defaultChecked={defaults.heroActive}
                className="size-4 accent-accent"
              />
              Hero bölümünü göster
            </label>
          </div>
        </section>

        <button
          type="submit"
          disabled={isPending}
          className="mt-6 h-10 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50"
        >
          {isPending ? "Kaydediliyor..." : "Görünürlük Ayarlarını Kaydet"}
        </button>
      </form>
    </>
  );
}
