"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const baseLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Siparişler" },
  { href: "/admin/orders/production", label: "Üretim Takibi" },
  { href: "/admin/products", label: "Ürünler" },
  { href: "/admin/categories", label: "Kategoriler" },
  { href: "/admin/content", label: "İçerik" },
  { href: "/admin/media", label: "Medya" },
];

// Yalnızca ADMIN rolüne gösterilen bağlantılar.
const adminLinks = [
  { href: "/admin/settings", label: "Ayarlar" },
  { href: "/admin/users", label: "Yöneticiler" },
];

export function AdminNav({ role = "EDITOR" }: { role?: "ADMIN" | "EDITOR" }) {
  const pathname = usePathname();
  const links = role === "ADMIN" ? [...baseLinks, ...adminLinks] : baseLinks;

  return (
    <nav className="flex flex-col gap-0.5" aria-label="Yönetim menüsü">
      {links.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-md px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-secondary font-medium text-secondary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
