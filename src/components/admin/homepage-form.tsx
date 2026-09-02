"use client";

import { useActionState } from "react";

import {
  saveHomepageAction,
  type CmsActionState,
} from "@/app/admin/(panel)/content/actions";
import { MediaUploadButton } from "@/components/admin/media-upload-button";

export type HomepageDefaults = {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImageDesktop: string;
  heroImageMobile: string;
  heroCtaLabel: string;
  heroCtaUrl: string;
  heroCtaSecondaryLabel: string;
  heroCtaSecondaryUrl: string;
  heroAlignment: string;
  heroActive: boolean;
  storyTitle: string;
  storyDescription: string;
  storyImage: string;
  customProductionTitle: string;
  customProductionDescription: string;
  customProductionButtonLabel: string;
};

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring";
const labelClass = "mb-1.5 block text-sm text-muted-foreground";

export function HomepageForm({
  defaults,
  uploadImageAction,
}: {
  defaults: HomepageDefaults;
  uploadImageAction?: (formData: FormData) => Promise<void>;
}) {
  const [state, formAction, isPending] = useActionState<CmsActionState, FormData>(
    saveHomepageAction,
    {},
  );

  const mediaField = (name: keyof HomepageDefaults) => (
    <div className="flex items-center gap-2">
      <div className="h-9 min-w-0 flex-1 truncate rounded-md border border-input bg-muted/50 px-3 text-sm leading-9 text-muted-foreground">
        {defaults[name] || "Henüz görsel yok"}
      </div>
      {uploadImageAction && (
        <MediaUploadButton action={uploadImageAction} hiddenFields={{ field: name }} />
      )}
    </div>
  );

  return (
    <>
      {state?.error && (
        <p role="alert" className="mb-5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      {/* Görseller: yükleme anında kaydedilir */}
      <section className="rounded-md border border-border bg-card p-5">
        <h2 className="text-sm font-medium">Görseller</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Yüklenen görsel anında kaydedilir ve sitede kullanılır.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <span className={labelClass}>Hero — Masaüstü</span>
            {mediaField("heroImageDesktop")}
          </div>
          <div>
            <span className={labelClass}>Hero — Mobil</span>
            {mediaField("heroImageMobile")}
          </div>
          <div className="sm:col-span-2 sm:max-w-sm">
            <span className={labelClass}>Hikâye Bölümü</span>
            {mediaField("storyImage")}
          </div>
        </div>
      </section>

      <form action={formAction}>
        {/* Hero */}
        <section className="mt-6 rounded-md border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Hero Bölümü</h2>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                name="heroActive"
                defaultChecked={defaults.heroActive}
                className="size-4 accent-accent"
              />
              Göster
            </label>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <span className={labelClass}>Başlık</span>
              <input name="heroTitle" defaultValue={defaults.heroTitle} className={inputClass} />
            </div>
            <div>
              <span className={labelClass}>Alt Başlık</span>
              <input name="heroSubtitle" defaultValue={defaults.heroSubtitle} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <span className={labelClass}>Açıklama</span>
              <textarea
                name="heroDescription"
                rows={2}
                defaultValue={defaults.heroDescription}
                className={`${inputClass} resize-y`}
              />
            </div>
            <div>
              <span className={labelClass}>CTA Yazısı</span>
              <input name="heroCtaLabel" defaultValue={defaults.heroCtaLabel} className={inputClass} />
            </div>
            <div>
              <span className={labelClass}>CTA Hedefi</span>
              <input name="heroCtaUrl" placeholder="/urunler" defaultValue={defaults.heroCtaUrl} className={inputClass} />
            </div>
            <div>
              <span className={labelClass}>2. CTA Yazısı</span>
              <input name="heroCtaSecondaryLabel" defaultValue={defaults.heroCtaSecondaryLabel} className={inputClass} />
            </div>
            <div>
              <span className={labelClass}>2. CTA Hedefi</span>
              <input name="heroCtaSecondaryUrl" defaultValue={defaults.heroCtaSecondaryUrl} className={inputClass} />
            </div>
            <div>
              <span className={labelClass}>İçerik Hizalama</span>
              <select name="heroAlignment" defaultValue={defaults.heroAlignment} className={inputClass}>
                <option value="left">Sola</option>
                <option value="center">Ortaya (tam genişlik)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Hikâye */}
        <section className="mt-6 rounded-md border border-border bg-card p-5">
          <h2 className="text-sm font-medium">Marka / Üretim Hikâyesi</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <span className={labelClass}>Başlık</span>
              <input name="storyTitle" defaultValue={defaults.storyTitle} className={inputClass} />
            </div>
            <div>
              <span className={labelClass}>Açıklama</span>
              <textarea
                name="storyDescription"
                rows={3}
                defaultValue={defaults.storyDescription}
                className={`${inputClass} resize-y`}
              />
            </div>
          </div>
        </section>

        {/* Özel üretim CTA */}
        <section className="mt-6 rounded-md border border-border bg-card p-5">
          <h2 className="text-sm font-medium">Özel Üretim CTA</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Buton hedefi WhatsApp numarası ayarlarından alınır.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <span className={labelClass}>Başlık</span>
              <input name="customProductionTitle" defaultValue={defaults.customProductionTitle} className={inputClass} />
            </div>
            <div>
              <span className={labelClass}>Buton Yazısı</span>
              <input
                name="customProductionButtonLabel"
                defaultValue={defaults.customProductionButtonLabel}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <span className={labelClass}>Açıklama</span>
              <textarea
                name="customProductionDescription"
                rows={2}
                defaultValue={defaults.customProductionDescription}
                className={`${inputClass} resize-y`}
              />
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={isPending}
          className="mt-6 h-10 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50"
        >
          {isPending ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </form>
    </>
  );
}
