"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

type GalleryImage = {
  id: string;
  url: string;
  altText: string | null;
};

export function ProductGallery({
  images,
  productName,
}: {
  images: GalleryImage[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const active = images[activeIndex];

  if (!active) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-md bg-muted">
        <span
          aria-hidden="true"
          className="font-heading text-7xl text-muted-foreground/30 select-none"
        >
          {productName.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  const lightboxImage = images[lightboxIndex];

  function openLightbox(index: number) {
    setLightboxIndex(index);
    dialogRef.current?.showModal();
  }

  function step(delta: number) {
    setLightboxIndex((current) => (current + delta + images.length) % images.length);
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => openLightbox(activeIndex)}
        aria-label="Görseli büyüt"
        className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-md border border-border bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Image
          key={active.id}
          src={active.url}
          alt={active.altText || productName}
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover"
          priority
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground opacity-0 shadow-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <ZoomIn className="size-3.5" />
          Büyüt
        </span>
      </button>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`${productName} görsel ${index + 1}`}
              aria-current={index === activeIndex}
              className={`relative aspect-square overflow-hidden rounded-sm transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                index === activeIndex
                  ? "ring-2 ring-foreground"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="10vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <dialog
        ref={dialogRef}
        aria-label={`${productName} görseli`}
        onClose={() => setActiveIndex(lightboxIndex)}
        onKeyDown={(event) => {
          if (images.length < 2) return;
          if (event.key === "ArrowLeft") step(-1);
          if (event.key === "ArrowRight") step(1);
        }}
        onClick={(event) => {
          // Yalnızca arka plana (dialog'un kendisine) tıklanınca kapat.
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="m-auto max-h-none max-w-none overscroll-contain bg-transparent p-0 backdrop:bg-black/85"
      >
        {lightboxImage && (
          <div className="relative">
            <Image
              src={lightboxImage.url}
              alt={lightboxImage.altText || productName}
              width={1600}
              height={1200}
              sizes="92vw"
              className="max-h-[85svh] w-auto max-w-[92vw] rounded-md object-contain"
            />

            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Kapat"
              className="absolute -top-3 -right-3 flex size-10 items-center justify-center rounded-full bg-background text-foreground shadow-md transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <X aria-hidden="true" className="size-5" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Önceki görsel"
                  className="absolute top-1/2 left-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-md transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <ChevronLeft aria-hidden="true" className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Sonraki görsel"
                  className="absolute top-1/2 right-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-md transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <ChevronRight aria-hidden="true" className="size-5" />
                </button>
              </>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}
