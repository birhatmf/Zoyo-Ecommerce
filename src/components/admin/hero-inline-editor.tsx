"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import {
  saveHeroSlideFieldAction,
  saveHomepageFieldAction,
} from "@/app/admin/(panel)/content/actions";
import { InlineEditable } from "@/components/admin/inline-editable";

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

export type HeroContentItem = {
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

// Hero ve slider'ın birebir görünümünü taklit eden canlı düzenleyici.
// Metinler contentEditable; blur'da ilgili alan action'ına kaydedilir.
export function HeroInlineEditor({
  slides,
  content,
}: {
  slides: HeroSlideItem[];
  content: HeroContentItem;
}) {
  const activeSlides = slides.filter((s) => s.active);
  const showSlider = activeSlides.length > 0;

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          Canlı Önizleme — metne tıklayıp düzenleyin
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Otomatik kaydedilir
        </span>
      </div>

      {showSlider ? (
        <SliderPreview slides={activeSlides} />
      ) : (
        <ClassicHeroPreview content={content} />
      )}

      {/* Klasik hero alanları (slider yoksa görünür) */}
      {!showSlider && (
        <div className="border-t border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Klasik hero — slider yoksa bu alanlar gösterilir. Slider eklenirse bu
            alanlar yerine slider kullanılır.
          </p>
          <div className="mt-3 space-y-2">
            <FieldRow
              label="Başlık"
              value={content.heroTitle}
              action={saveHomepageFieldAction}
              fieldKey="heroTitle"
            />
            <FieldRow
              label="Alt Başlık"
              value={content.heroSubtitle}
              action={saveHomepageFieldAction}
              fieldKey="heroSubtitle"
            />
            <FieldRow
              label="Açıklama"
              value={content.heroDescription}
              action={saveHomepageFieldAction}
              fieldKey="heroDescription"
              multiline
            />
            <FieldRow
              label="CTA Yazısı"
              value={content.heroCtaLabel}
              action={saveHomepageFieldAction}
              fieldKey="heroCtaLabel"
            />
            <FieldRow
              label="CTA Hedefi"
              value={content.heroCtaUrl}
              action={saveHomepageFieldAction}
              fieldKey="heroCtaUrl"
            />
            <FieldRow
              label="2. CTA Yazısı"
              value={content.heroCtaSecondaryLabel}
              action={saveHomepageFieldAction}
              fieldKey="heroCtaSecondaryLabel"
            />
            <FieldRow
              label="2. CTA Hedefi"
              value={content.heroCtaSecondaryUrl}
              action={saveHomepageFieldAction}
              fieldKey="heroCtaSecondaryUrl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SliderPreview({ slides }: { slides: HeroSlideItem[] }) {
  const slide = slides[0];
  if (!slide) return null;

  return (
    <div className="relative h-[400px] overflow-hidden bg-primary">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={slide.imageUrl}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/55 to-primary/15" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary/70 to-transparent" />

      <div className="relative z-20 mx-auto flex h-full max-w-6xl items-center px-4 sm:px-6">
        <div className="max-w-2xl">
          <InlineEditable
            action={saveHeroSlideFieldAction}
            fieldName="id"
            valueField="value"
            value={slide.subtitle ?? ""}
            hiddenFields={{ id: slide.id, key: "subtitle" }}
            className="text-xs font-medium tracking-[0.25em] text-accent uppercase"
          />
          <InlineEditable
            action={saveHeroSlideFieldAction}
            fieldName="id"
            valueField="value"
            value={slide.title}
            hiddenFields={{ id: slide.id, key: "title" }}
            className="mt-4 block font-heading text-4xl leading-tight font-medium text-background sm:text-5xl lg:text-6xl"
          />
          <InlineEditable
            action={saveHeroSlideFieldAction}
            fieldName="id"
            valueField="value"
            value={slide.description ?? ""}
            hiddenFields={{ id: slide.id, key: "description" }}
            className="mt-5 block max-w-lg leading-relaxed text-background/75"
            multiline
          />
          {slide.ctaLabel && slide.ctaUrl && (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="inline-flex h-11 items-center gap-2 rounded-md bg-accent px-6 text-sm font-medium text-accent-foreground">
                <InlineEditable
                  action={saveHeroSlideFieldAction}
                  fieldName="id"
                  valueField="value"
                  value={slide.ctaLabel}
                  hiddenFields={{ id: slide.id, key: "ctaLabel" }}
                  className=""
                />
                <ArrowRight className="size-4" />
              </span>
            </div>
          )}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Önceki slayt"
            className="absolute top-1/2 left-3 z-30 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-background/25 bg-primary/40 text-background"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Sonraki slayt"
            className="absolute top-1/2 right-3 z-30 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-background/25 bg-primary/40 text-background"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}

      <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2">
        {slides.map((s, i) => (
          <span
            key={s.id}
            className={`h-1.5 rounded-full ${i === 0 ? "w-8 bg-accent" : "w-3 bg-background/40"}`}
          />
        ))}
      </div>
    </div>
  );
}

function ClassicHeroPreview({ content }: { content: HeroContentItem }) {
  return (
    <div className="border-b border-border">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:gap-16">
        <div>
          <InlineEditable
            action={saveHomepageFieldAction}
            fieldName="key"
            valueField="value"
            value={content.heroSubtitle}
            hiddenFields={{ key: "heroSubtitle" }}
            className="text-xs font-medium tracking-[0.2em] text-accent uppercase"
          />
          <InlineEditable
            action={saveHomepageFieldAction}
            fieldName="key"
            valueField="value"
            value={content.heroTitle}
            hiddenFields={{ key: "heroTitle" }}
            className="mt-4 block font-heading text-4xl leading-tight font-medium text-balance sm:text-5xl"
          />
          <InlineEditable
            action={saveHomepageFieldAction}
            fieldName="key"
            valueField="value"
            value={content.heroDescription}
            hiddenFields={{ key: "heroDescription" }}
            className="mt-5 block max-w-lg leading-relaxed text-muted-foreground"
            multiline
          />
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {content.heroCtaLabel && content.heroCtaUrl && (
              <span className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground">
                <InlineEditable
                  action={saveHomepageFieldAction}
                  fieldName="key"
                  valueField="value"
                  value={content.heroCtaLabel}
                  hiddenFields={{ key: "heroCtaLabel" }}
                  className=""
                />
                <ArrowRight className="size-4" />
              </span>
            )}
            {content.heroCtaSecondaryLabel && content.heroCtaSecondaryUrl && (
              <span className="inline-flex h-11 items-center rounded-md border border-border px-6 text-sm font-medium">
                <InlineEditable
                  action={saveHomepageFieldAction}
                  fieldName="key"
                  valueField="value"
                  value={content.heroCtaSecondaryLabel}
                  hiddenFields={{ key: "heroCtaSecondaryLabel" }}
                  className=""
                />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldRow({
  label,
  value,
  action,
  fieldKey,
  multiline,
}: {
  label: string;
  value: string;
  action: (formData: FormData) => Promise<unknown>;
  fieldKey: string;
  multiline?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="w-32 shrink-0 text-xs text-muted-foreground">{label}</span>
      <InlineEditable
        action={action}
        fieldName="key"
        valueField="value"
        value={value}
        hiddenFields={{ key: fieldKey }}
        className=""
        multiline={multiline}
      />
    </div>
  );
}
