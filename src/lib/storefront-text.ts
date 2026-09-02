import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/prisma";

// Storefront'ta gösterilen, işletmenin kontrol etmesi gereken tüm metinler.
// Her anahtar için bir default değer ve grup bilgisi tutulur. Değer DB'de
// yoksa default kullanılır (seed çalışmamış olsa bile uygulama kırılmaz).
export type StorefrontTextGroup =
  | "navbar"
  | "footer"
  | "homepage"
  | "checkout"
  | "cart"
  | "orderSuccess"
  | "common";

export type StorefrontTextDef = {
  key: string;
  group: StorefrontTextGroup;
  label: string;
  defaultValue: string;
  multiline?: boolean;
};

export const STOREFRONT_TEXT_DEFS: StorefrontTextDef[] = [
  // navbar
  { key: "navbar.products", group: "navbar", label: "Ürünler", defaultValue: "Ürünler" },
  { key: "navbar.about", group: "navbar", label: "Hakkımızda", defaultValue: "Hakkımızda" },
  { key: "navbar.contact", group: "navbar", label: "İletişim", defaultValue: "İletişim" },
  { key: "navbar.categories", group: "navbar", label: "Kategoriler başlığı", defaultValue: "Kategoriler" },
  { key: "navbar.cart", group: "navbar", label: "Sepet (aria)", defaultValue: "Sepet" },
  { key: "navbar.openMenu", group: "navbar", label: "Menüyü aç (aria)", defaultValue: "Menüyü aç" },
  { key: "navbar.whatsapp", group: "navbar", label: "WhatsApp (aria)", defaultValue: "WhatsApp ile iletişime geç" },

  // footer
  { key: "footer.contactHeading", group: "footer", label: "İletişim başlığı", defaultValue: "İletişim" },

  // homepage
  { key: "homepage.storyHeading", group: "homepage", label: "Hikâye bölümü başlığı", defaultValue: "Hikâyemiz" },
  { key: "homepage.categoriesHeading", group: "homepage", label: "Kategoriler başlığı", defaultValue: "Kategoriler" },
  { key: "homepage.featuredHeading", group: "homepage", label: "Öne çıkan ürünler başlığı", defaultValue: "Öne Çıkan Ürünler" },
  { key: "homepage.viewAll", group: "homepage", label: "Tümünü gör linki", defaultValue: "Tümünü Gör" },
  { key: "homepage.allProducts", group: "homepage", label: "Tüm ürünler linki", defaultValue: "Tüm Ürünler" },

  // cart
  { key: "cart.emptyTitle", group: "cart", label: "Boş sepet başlığı", defaultValue: "Sepetiniz boş" },
  { key: "cart.emptyDescription", group: "cart", label: "Boş sepet açıklaması", defaultValue: "Koleksiyonumuzdan beğendiğiniz parçaları sepete ekleyebilirsiniz." },
  { key: "cart.explore", group: "cart", label: "Ürünleri keşfet butonu", defaultValue: "Ürünleri Keşfet" },
  { key: "cart.subtotal", group: "cart", label: "Ara toplam", defaultValue: "Ara Toplam" },
  { key: "cart.delivery", group: "cart", label: "Teslimat etiketi", defaultValue: "Teslimat" },
  { key: "cart.deliveryNote", group: "cart", label: "Teslimat notu", defaultValue: "Üretim sonrası belirtilir" },
  { key: "cart.total", group: "cart", label: "Toplam", defaultValue: "Toplam" },
  { key: "cart.checkout", group: "cart", label: "Siparişi tamamla butonu", defaultValue: "Siparişi Tamamla" },
  { key: "cart.noOnlinePayment", group: "cart", label: "Online ödeme yok bilgisi", defaultValue: "Online ödeme alınmamaktadır. Sipariş talebiniz firma tarafından onaylandıktan sonra sizinle iletişime geçilir.", multiline: true },
  { key: "cart.removeItem", group: "cart", label: "Sepetten çıkar (aria)", defaultValue: "sepetten çıkar" },
  { key: "cart.decrease", group: "cart", label: "Miktarı azalt (aria)", defaultValue: "Miktarı azalt" },
  { key: "cart.increase", group: "cart", label: "Miktarı artır (aria)", defaultValue: "Miktarı artır" },

  // checkout
  { key: "checkout.title", group: "checkout", label: "Sayfa başlığı", defaultValue: "Siparişi Tamamla" },
  { key: "checkout.contactHeading", group: "checkout", label: "İletişim bölüm başlığı", defaultValue: "İletişim Bilgileri" },
  { key: "checkout.deliveryHeading", group: "checkout", label: "Teslimat bölüm başlığı", defaultValue: "Teslimat Adresi" },
  { key: "checkout.invoiceHeading", group: "checkout", label: "Fatura bölüm başlığı", defaultValue: "Fatura Bilgileri" },
  { key: "checkout.legalHeading", group: "checkout", label: "Yasal onaylar başlığı", defaultValue: "Yasal Onaylar" },
  { key: "checkout.notesHeading", group: "checkout", label: "Sipariş maddeleri başlığı", defaultValue: "Sipariş Maddeleri" },
  { key: "checkout.notesHint", group: "checkout", label: "Sipariş maddeleri açıklaması", defaultValue: "Sipariş sürecinize dair bilmeniz gereken maddeler:", multiline: true },
  { key: "checkout.summary", group: "checkout", label: "Sipariş özeti başlığı", defaultValue: "Sipariş Özeti" },
  { key: "checkout.submit", group: "checkout", label: "Sipariş oluştur butonu", defaultValue: "Sipariş Talebi Oluştur" },
  { key: "checkout.noOnlinePayment", group: "checkout", label: "Online ödeme yok bilgisi", defaultValue: "Online ödeme alınmamaktadır. Sipariş talebiniz firma tarafından onaylandıktan sonra sizinle iletişime geçilir.", multiline: true },
  { key: "checkout.acceptSuffix", group: "checkout", label: "Onay metni son eki", defaultValue: "okudum ve kabul ediyorum." },

  // order success
  { key: "orderSuccess.eyebrow", group: "orderSuccess", label: "Üst etiket", defaultValue: "Sipariş Talebiniz Alındı" },
  { key: "orderSuccess.title", group: "orderSuccess", label: "Başlık", defaultValue: "Teşekkürler!" },
  { key: "orderSuccess.message", group: "orderSuccess", label: "Açıklama", defaultValue: "Sipariş talebiniz alınmıştır. Siparişiniz firmamız tarafından kontrol edildikten sonra sizinle iletişime geçilecektir.", multiline: true },
  { key: "orderSuccess.orderNumber", group: "orderSuccess", label: "Sipariş no etiketi", defaultValue: "Sipariş Numaranız" },
  { key: "orderSuccess.total", group: "orderSuccess", label: "Toplam etiketi", defaultValue: "Toplam" },
  { key: "orderSuccess.bankHeading", group: "orderSuccess", label: "Banka bilgileri başlığı", defaultValue: "Banka Bilgileri" },
  { key: "orderSuccess.noOnlinePayment", group: "orderSuccess", label: "Online ödeme yok bilgisi", defaultValue: "Online ödeme alınmamaktadır. Ödeme yapmak isterseniz aşağıdaki hesaplara transfer gerçekleştirebilirsiniz.", multiline: true },
  { key: "orderSuccess.contactHeading", group: "orderSuccess", label: "İletişime geçin başlığı", defaultValue: "İletişime Geçin" },
  { key: "orderSuccess.contactHint", group: "orderSuccess", label: "İletişim açıklaması", defaultValue: "Siparişiniz hakkında soru sormak veya bilgi almak için bize ulaşabilirsiniz.", multiline: true },
  { key: "orderSuccess.whatsapp", group: "orderSuccess", label: "WhatsApp butonu", defaultValue: "WhatsApp ile Gönder" },
  { key: "orderSuccess.call", group: "orderSuccess", label: "Telefon butonu", defaultValue: "Telefonla Ara" },
  { key: "orderSuccess.continue", group: "orderSuccess", label: "Alışverişe devam linki", defaultValue: "Alışverişe devam et" },
] as const;

export type StorefrontTextKey = (typeof STOREFRONT_TEXT_DEFS)[number]["key"];

const DEFAULTS = Object.fromEntries(
  STOREFRONT_TEXT_DEFS.map((def) => [def.key, def.defaultValue]),
) as Record<StorefrontTextKey, string>;

// DB'de kayıtlı metinleri okur; eksik anahtarlar default ile doldurulur.
export const getStorefrontTexts = cache(async (): Promise<Record<StorefrontTextKey, string>> => {
  const rows = await prisma.storefrontText.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Partial<
    Record<StorefrontTextKey, string>
  >;
  const merged = { ...DEFAULTS, ...map } as Record<StorefrontTextKey, string>;
  return merged;
});

export async function getStorefrontText(key: StorefrontTextKey): Promise<string> {
  const texts = await getStorefrontTexts();
  return texts[key] ?? DEFAULTS[key];
}
