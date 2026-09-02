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

export function whatsappUrl(phone: string, message: string): string {
  const normalized = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function telUrl(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
