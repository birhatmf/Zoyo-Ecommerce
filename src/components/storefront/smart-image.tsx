import Image from "next/image";

const IMAGE_FALLBACK_SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw";

type SmartImageProps = {
  src?: string | null;
  alt: string;
  fallbackLabel?: string;
  sizes?: string;
  className?: string;
};

export function SmartImage({
  src,
  alt,
  fallbackLabel,
  sizes = IMAGE_FALLBACK_SIZES,
  className,
}: SmartImageProps) {
  if (!src) {
    return (
      <div
        aria-hidden="true"
        className={`flex items-center justify-center bg-muted ${className ?? ""}`}
      >
        <span className="font-heading text-5xl text-muted-foreground/30 select-none">
          {(fallbackLabel || alt).charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={`object-cover ${className ?? ""}`}
    />
  );
}
