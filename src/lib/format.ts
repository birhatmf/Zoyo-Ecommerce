const currencyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPrice(
  value: string | number | { toString(): string },
): string {
  return currencyFormatter.format(Number(value));
}

// İndirim yüzdesi: yalnızca discountPrice geçerli (0'dan büyük ve price'tan
// küçük) olduğunda tam sayı yüzde döner, aksi halde null. Görünür bir indirim
// oluşmayan (%1 altı) durumlarda da null döner.
export function discountPercent(
  price: string | number | { toString(): string },
  discountPrice: string | number | { toString(): string } | null | undefined,
): number | null {
  if (discountPrice === null || discountPrice === undefined) return null;
  const base = Number(price);
  const discounted = Number(discountPrice);
  if (!Number.isFinite(base) || !Number.isFinite(discounted)) return null;
  if (base <= 0 || discounted <= 0 || discounted >= base) return null;
  const percent = Math.floor(((base - discounted) / base) * 100);
  return percent >= 1 ? percent : null;
}

export function whatsappUrl(phone: string, message: string): string {
  const normalized = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function telUrl(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

// Adres için tıklanabilir harita bağlantısı: önce açık Google Maps URL'si,
// yoksa adresten harita araması üretilir.
export function mapsUrl(
  address: string | undefined,
  explicit?: string | undefined,
): string | null {
  const url = (explicit ?? "").trim();
  if (url) return url;
  const addr = (address ?? "").trim();
  if (addr.length < 3 || addr === "-") return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
}
