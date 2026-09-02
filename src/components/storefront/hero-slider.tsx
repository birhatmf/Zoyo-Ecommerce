"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export type HeroSlideData = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string;
  ctaLabel: string | null;
  ctaUrl: string | null;
};

const AUTOPLAY_MS = 6000;

export function HeroSlider({ slides }: { slides: HeroSlideData[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);

  const count = slides.length;
  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = query.matches;
    const onChange = (event: MediaQueryListEvent) => {
      reducedMotion.current = event.matches;
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (count < 2 || paused || reducedMotion.current) return;

    // Sekme arka plandayken zamanlayıcı birikmesin
    const timer = setTimeout(() => go(index + 1), AUTOPLAY_MS);

    const onVisibility = () => {
      if (document.visibilityState === "hidden") clearTimeout(timer);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [index, paused, count, go]);

  // Klavye ile gezinme (yalnızca slider odaktayken)
  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowLeft") go(index - 1);
    if (event.key === "ArrowRight") go(index + 1);
  }

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label="Öne çıkanlar"
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative h-[72svh] min-h-[440px] w-full overflow-hidden bg-primary outline-none sm:h-[78svh]"
    >
      {/* Slaytlar */}
      {slides.map((slide, i) => {
        const active = i === index;
        return (
          <div
            key={slide.id}
            aria-hidden={!active}
            className={`absolute inset-0 transition-opacity duration-[900ms] ease-out ${
              active ? "z-10 opacity-100" : "z-0 opacity-0"
            }`}
          >
            <div
              key={`${slide.id}-${active}`}
              className={`absolute inset-0 ${active ? "hero-anim-settle" : ""}`}
            >
              {!active ? (
                <div className="hero-anim-drift absolute inset-0">
                  <SlideImage slide={slide} />
                </div>
              ) : (
                <SlideImage slide={slide} />
              )}
            </div>
            {/* Okunabilirlik perdesi */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/55 to-primary/15" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary/70 to-transparent" />
          </div>
        );
      })}

      {/* İçerik */}
      <div className="relative z-20 mx-auto flex h-full max-w-6xl items-center px-4 sm:px-6">
        <div key={index} className="max-w-2xl">
          {slides[index].subtitle && (
            <p className="hero-anim-sub text-xs font-medium tracking-[0.25em] text-accent uppercase">
              {slides[index].subtitle}
            </p>
          )}
          <h1 className="hero-anim-title mt-4 font-heading text-4xl leading-tight font-medium text-balance text-background sm:text-5xl lg:text-6xl">
            {slides[index].title}
          </h1>
          {slides[index].description && (
            <p className="hero-anim-desc mt-5 max-w-lg leading-relaxed text-background/75">
              {slides[index].description}
            </p>
          )}
          {slides[index].ctaLabel && slides[index].ctaUrl && (
            <div className="hero-anim-cta mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={slides[index].ctaUrl!}
                tabIndex={0}
                className="inline-flex h-11 items-center gap-2 rounded-md bg-accent px-6 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
              >
                {slides[index].ctaLabel}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Kontroller */}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Önceki slayt"
            className="absolute top-1/2 left-3 z-30 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-background/25 bg-primary/40 text-background backdrop-blur-sm transition-colors hover:bg-primary/60 focus-visible:ring-2 focus-visible:ring-accent sm:left-5"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Sonraki slayt"
            className="absolute top-1/2 right-3 z-30 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-background/25 bg-primary/40 text-background backdrop-blur-sm transition-colors hover:bg-primary/60 focus-visible:ring-2 focus-visible:ring-accent sm:right-5"
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2.5">
            {slides.map((slide, i) => (
              <button
                key={`dot-${slide.id}`}
                type="button"
                onClick={() => go(i)}
                aria-label={`${i + 1}. slayta git`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === index
                    ? "w-8 bg-accent"
                    : "w-3 bg-background/40 hover:bg-background/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function SlideImage({ slide }: { slide: HeroSlideData }) {
  return (
    <Image
      src={slide.imageUrl}
      alt=""
      fill
      priority={false}
      sizes="100vw"
      className="object-cover"
    />
  );
}
