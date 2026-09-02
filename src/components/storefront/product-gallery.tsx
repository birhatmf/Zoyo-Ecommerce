"use client";

import { useState } from "react";
import Image from "next/image";

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

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-muted">
        <Image
          key={active.id}
          src={active.url}
          alt={active.altText || productName}
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover"
          priority
        />
      </div>
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
    </div>
  );
}
