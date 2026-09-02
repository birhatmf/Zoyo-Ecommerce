import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const storefrontTexts: Record<string, string> = {
  "navbar.products": "Ürünler",
  "navbar.about": "Hakkımızda",
  "navbar.contact": "İletişim",
  "navbar.categories": "Kategoriler",
  "navbar.cart": "Sepet",
  "navbar.openMenu": "Menüyü aç",
  "navbar.whatsapp": "WhatsApp ile iletişime geç",
  "footer.contactHeading": "İletişim",
  "homepage.storyHeading": "Hikâyemiz",
  "homepage.categoriesHeading": "Kategoriler",
  "homepage.featuredHeading": "Öne Çıkan Ürünler",
  "homepage.viewAll": "Tümünü Gör",
  "homepage.allProducts": "Tüm Ürünler",
  "cart.emptyTitle": "Sepetiniz boş",
  "cart.emptyDescription":
    "Koleksiyonumuzdan beğendiğiniz parçaları sepete ekleyebilirsiniz.",
  "cart.explore": "Ürünleri Keşfet",
  "cart.subtotal": "Ara Toplam",
  "cart.delivery": "Teslimat",
  "cart.deliveryNote": "Üretim sonrası belirtilir",
  "cart.total": "Toplam",
  "cart.checkout": "Siparişi Tamamla",
  "cart.noOnlinePayment":
    "Online ödeme alınmamaktadır. Sipariş talebiniz firma tarafından onaylandıktan sonra sizinle iletişime geçilir.",
  "cart.removeItem": "sepetten çıkar",
  "cart.decrease": "Miktarı azalt",
  "cart.increase": "Miktarı artır",
  "checkout.title": "Siparişi Tamamla",
  "checkout.contactHeading": "İletişim Bilgileri",
  "checkout.deliveryHeading": "Teslimat Adresi",
  "checkout.invoiceHeading": "Fatura Bilgileri",
  "checkout.legalHeading": "Yasal Onaylar",
  "checkout.notesHeading": "Sipariş Maddeleri",
  "checkout.notesHint": "Sipariş sürecinize dair bilmeniz gereken maddeler:",
  "checkout.summary": "Sipariş Özeti",
  "checkout.submit": "Sipariş Talebi Oluştur",
  "checkout.noOnlinePayment":
    "Online ödeme alınmamaktadır. Sipariş talebiniz firma tarafından onaylandıktan sonra sizinle iletişime geçilir.",
  "checkout.acceptSuffix": "okudum ve kabul ediyorum.",
  "orderSuccess.eyebrow": "Sipariş Talebiniz Alındı",
  "orderSuccess.title": "Teşekkürler!",
  "orderSuccess.message":
    "Sipariş talebiniz alınmıştır. Siparişiniz firmamız tarafından kontrol edildikten sonra sizinle iletişime geçilecektir.",
  "orderSuccess.orderNumber": "Sipariş Numaranız",
  "orderSuccess.total": "Toplam",
  "orderSuccess.bankHeading": "Banka Bilgileri",
  "orderSuccess.noOnlinePayment":
    "Online ödeme alınmamaktadır. Ödeme yapmak isterseniz aşağıdaki hesaplara transfer gerçekleştirebilirsiniz.",
  "orderSuccess.contactHeading": "İletişime Geçin",
  "orderSuccess.contactHint":
    "Siparişiniz hakkında soru sormak veya bilgi almak için bize ulaşabilirsiniz.",
  "orderSuccess.whatsapp": "WhatsApp ile Gönder",
  "orderSuccess.call": "Telefonla Ara",
  "orderSuccess.continue": "Alışverişe devam et",
};

async function main() {
  for (const [key, value] of Object.entries(storefrontTexts)) {
    await prisma.storefrontText.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
  console.log(`Seeded ${Object.keys(storefrontTexts).length} storefront texts`);
}

main()
  .finally(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
