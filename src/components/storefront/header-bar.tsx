"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, ShoppingBag } from "lucide-react";

import { MobileNav } from "@/components/storefront/mobile-nav";
import { CartBadge } from "@/components/storefront/cart-badge";

type HeaderBarProps = {
  siteName: string;
  siteTitle: string;
  logoUrl?: string;
  links: { label: string; href: string }[];
  categories: { name: string; slug: string }[];
  waLink: string | null;
  // Slider üzerinde şeffaf başlangıç; kaydırınca katı hale döner
  overlay?: boolean;
  texts?: {
    categories: string;
    cart: string;
    openMenu: string;
    whatsapp: string;
  };
};

const SCROLL_THRESHOLD = 32;

export function HeaderBar({
  siteName,
  siteTitle,
  logoUrl,
  links,
  categories,
  waLink,
  overlay = false,
  texts,
}: HeaderBarProps) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Şeffaflık yalnızca slider'ın bulunduğu ana sayfada anlamlıdır
  const overlayActive = overlay && pathname === "/";

  useEffect(() => {
    if (!overlayActive) return;
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlayActive]);

  const light = overlayActive && !scrolled;

  const surfaceClass = light
    ? "border-transparent bg-transparent backdrop-blur-none"
    : "border-border bg-background/95 backdrop-blur-sm";

  const textClass = light
    ? "text-background"
    : "text-foreground";

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-300 ${surfaceClass}`}
      data-overlay={light ? "true" : undefined}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <MobileNav
            siteName={siteName}
            links={links}
            categories={categories}
            light={light}
            texts={{
              categories: texts?.categories ?? "Kategoriler",
              openMenu: texts?.openMenu ?? "Menüyü aç",
            }}
          />
          <Link
            href="/"
            aria-label={siteTitle}
            className={`font-heading text-xl font-medium tracking-[0.18em] uppercase ${textClass} transition-colors`}
          >
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={siteTitle}
                width={120}
                height={32}
                className="h-8 w-auto object-contain"
              />
            ) : (
              siteName
            )}
          </Link>
        </div>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Ana menü">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                light
                  ? "text-background/85 hover:text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={texts?.whatsapp ?? "WhatsApp ile iletişime geç"}
              className={`inline-flex size-9 items-center justify-center rounded-md transition-colors hover:bg-muted hover:text-foreground ${
                light ? "text-background" : "text-muted-foreground"
              }`}
            >
              <MessageCircle className="size-5" />
            </a>
          )}
          <Link
            href="/sepet"
            aria-label={texts?.cart ?? "Sepet"}
            className={`relative inline-flex size-9 items-center justify-center rounded-md transition-colors hover:bg-muted hover:text-foreground ${
              light ? "text-background" : "text-muted-foreground"
            }`}
          >
            <ShoppingBag className="size-5" />
            <CartBadge />
          </Link>
        </div>
      </div>
    </header>
  );
}
