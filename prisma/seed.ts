import "dotenv/config";

import { hashSync } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 8) {
    throw new Error(
      "SEED_ADMIN_PASSWORD must be set (min 8 chars). Do not hardcode production credentials.",
    );
  }

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin",
      email: adminEmail,
      passwordHash: hashSync(adminPassword, 12),
      role: "ADMIN",
    },
  });
  console.log(`✔ Admin user: ${adminEmail}`);

  // ---------- Site settings ----------
  const defaultSettings: Record<string, string> = {
    siteName: "Zoyo Mobilya",
    siteShortName: "Zoyo",
    siteDescription:
      "El işçiliği, doğal malzemeler ve zamansız tasarımlarla butik ahşap mobilya üretimi.",
    logoUrl: "",
    mobileLogoUrl: "",
    faviconUrl: "",
    footerLogoUrl: "",
    phone: "+905550000000",
    whatsapp: "+905550000000",
    email: "info@zoyo.example.com",
    address: "",
    instagram: "",
    facebook: "",
    youtube: "",
    workingHours: "Hafta içi 09:00 - 18:00",
    orderPrefix: "ZY",
    currency: "TRY",
    footerCopyright: `© ${new Date().getFullYear()} Zoyo Mobilya. Tüm hakları saklıdır.`,
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
  console.log("✔ Site settings");

  // ---------- Homepage content ----------
  await prisma.homepageContent.upsert({
    where: { id: "homepage" },
    update: {},
    create: {
      id: "homepage",
      heroTitle: "Doğal Ahşabın Zamansız Formu",
      heroSubtitle: "Butik üretim ahşap mobilya",
      heroDescription: "El işçiliği, doğal malzemeler ve zamansız tasarımlar.",
      heroCtaLabel: "Koleksiyonu Keşfet",
      heroCtaUrl: "/urunler",
      heroCtaSecondaryLabel: "Hakkımızda",
      heroCtaSecondaryUrl: "/hakkimizda",
      storyTitle: "Üretim Hikâyemiz",
      storyDescription:
        "Her parça, seçilmiş doğal ahşaptan ustalarımızın elinde, sizin için özel olarak üretilir.",
      customProductionTitle: "Özel Üretim Projeleriniz İçin",
      customProductionDescription:
        "Hayalinizdeki parçayı birlikte tasarlayalım. Ölçü ve malzeme tercihlerinize göre özel üretim yapıyoruz.",
      customProductionButtonLabel: "WhatsApp'tan Yazın",
      customProductionType: "WHATSAPP",
    },
  });
  console.log("✔ Homepage content");

  // ---------- Categories ----------
  const categoryData = [
    { name: "Bahçe Takımları", slug: "bahce-takimlari", sortOrder: 1 },
    { name: "Yemek Masaları", slug: "yemek-masalari", sortOrder: 2 },
    { name: "Dekoratif Ürünler", slug: "dekoratif-urunler", sortOrder: 3 },
  ];

  const categories: Record<string, string> = {};
  for (const c of categoryData) {
    const created = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, description: `${c.name} koleksiyonu`, active: true },
    });
    categories[c.slug] = created.id;
  }
  console.log("✔ Categories");

  // ---------- Products ----------
  const productData = [
    {
      name: "Lina Thermowood Bahçe Takımı",
      slug: "lina-thermowood-bahce-takimi",
      productCode: "ZY-BT-001",
      shortDescription: "6 kişilik thermowood bahçe oturma grubu",
      price: "48900.00",
      discountPrice: null as string | null,
      categorySlug: "bahce-takimlari",
      material: "Thermowood Çam",
      dimensions: "220 x 70 x 75 cm",
      productionTime: "10-15 iş günü",
      deliveryInformation: "Türkiye geneli ücretsiz teslimat",
      featured: true,
    },
    {
      name: "Ada Masif Yemek Masası",
      slug: "ada-masif-yemek-masasi",
      productCode: "ZY-YM-002",
      shortDescription: "8 kişilik masif meşe yemek masası",
      price: "36500.00",
      discountPrice: "32000.00",
      categorySlug: "yemek-masalari",
      material: "Masif Meşe",
      dimensions: "240 x 100 x 76 cm",
      productionTime: "15-20 iş günü",
      deliveryInformation: "Türkiye geneli ücretsiz teslimat",
      featured: true,
    },
    {
      name: "Nova Ceviz Konsol",
      slug: "nova-ceviz-konsol",
      productCode: "ZY-DK-003",
      shortDescription: "El yapımı ceviz konsol masa",
      price: "18400.00",
      discountPrice: null,
      categorySlug: "dekoratif-urunler",
      material: "Masif Ceviz",
      dimensions: "140 x 40 x 85 cm",
      productionTime: "7-10 iş günü",
      deliveryInformation: "Türkiye geneli ücretsiz teslimat",
      featured: false,
    },
    {
      name: "Terrace Köşe Takımı",
      slug: "terrace-kose-takimi",
      productCode: "ZY-BT-004",
      shortDescription: "Modüler bahçe köşe oturma grubu",
      price: "57800.00",
      discountPrice: null,
      categorySlug: "bahce-takimlari",
      material: "Iroko Ahşap",
      dimensions: "260 x 180 cm",
      productionTime: "15-20 iş günü",
      deliveryInformation: "Türkiye geneli ücretsiz teslimat",
      featured: true,
    },
    {
      name: "Orion Yuvarlak Sehpa",
      slug: "orion-yuvarlak-sehpa",
      productCode: "ZY-DK-005",
      shortDescription: "Masif ahşap yuvarlak orta sehpa",
      price: "7900.00",
      discountPrice: "6500.00",
      categorySlug: "dekoratif-urunler",
      material: "Masif Kayın",
      dimensions: "Ø80 x 45 cm",
      productionTime: "5-7 iş günü",
      deliveryInformation: "Türkiye geneli ücretsiz teslimat",
      featured: false,
    },
    {
      name: "Vera Uzun Sandalye",
      slug: "vera-uzun-sandalye",
      productCode: "YM-006",
      shortDescription: "Ahşap iskeletli ferah bank sandalye",
      price: "12300.00",
      discountPrice: null,
      categorySlug: "yemek-masalari",
      material: "Masif Meşe + Keten Döşeme",
      dimensions: "160 x 38 x 45 cm",
      productionTime: "7-10 iş günü",
      deliveryInformation: "Türkiye geneli ücretsiz teslimat",
      featured: false,
    },
  ];

  for (const p of productData) {
    const { categorySlug, ...data } = p;
    await prisma.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        categoryId: categories[categorySlug],
        status: "ACTIVE",
        description:
          "Seçkin doğal ahşaptan, usta işçiliğiyle üretilmiş butik bir parça. Her ürün el yapımı olduğu için doku ve tonlarda hafif farklılıklar gösterebilir.",
      },
    });
  }
  console.log("✔ Products (6)");

  // ---------- Bank account ----------
  const existingBank = await prisma.bankAccount.findFirst();
  if (!existingBank) {
    await prisma.bankAccount.create({
      data: {
        bankName: "Örnek Bankası",
        accountHolder: "Zoyo Mobilya Ltd. Şti.",
        iban: "TR000000000000000000000000",
        description: "Sipariş ödemeleri için",
        active: true,
        sortOrder: 0,
      },
    });
  }
  console.log("✔ Bank account");

  // ---------- CMS pages ----------
  const cmsPages = [
    {
      title: "KVKK Aydınlatma Metni",
      slug: "kvkk",
      type: "LEGAL" as const,
      content:
        "<p>6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni buraya gelir.</p>",
    },
    {
      title: "Gizlilik Politikası",
      slug: "gizlilik-politikasi",
      type: "LEGAL" as const,
      content: "<p>Gizlilik politikası içeriği buraya gelir.</p>",
    },
    {
      title: "Mesafeli Satış Sözleşmesi",
      slug: "mesafeli-satis-sozlesmesi",
      type: "LEGAL" as const,
      content: "<p>Mesafeli satış sözleşmesi içeriği buraya gelir.</p>",
    },
    {
      title: "Teslimat ve İade Politikası",
      slug: "teslimat-ve-iade",
      type: "LEGAL" as const,
      content: "<p>Teslimat ve iade politikası içeriği buraya gelir.</p>",
    },
    {
      title: "Hakkımızda",
      slug: "hakkimizda",
      type: "CORPORATE" as const,
      content: "<p>Firma hakkında içerik buraya gelir.</p>",
    },
    {
      title: "İletişim",
      slug: "iletisim",
      type: "CORPORATE" as const,
      content: "<p>İletişim bilgileri buraya gelir.</p>",
    },
  ];

  for (const page of cmsPages) {
    await prisma.cmsPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }
  console.log("✔ CMS pages");

  // ---------- Footer link groups ----------
  const corporateGroup = await prisma.footerLinkGroup.upsert({
    where: { id: "a0000000-0000-4000-8000-000000000001" },
    update: {},
    create: {
      id: "a0000000-0000-4000-8000-000000000001",
      title: "Kurumsal",
      sortOrder: 0,
      links: {
        create: [
          { label: "Hakkımızda", url: "/hakkimizda", sortOrder: 0 },
          { label: "İletişim", url: "/iletisim", sortOrder: 1 },
        ],
      },
    },
  });

  const legalGroup = await prisma.footerLinkGroup.upsert({
    where: { id: "a0000000-0000-4000-8000-000000000002" },
    update: {},
    create: {
      id: "a0000000-0000-4000-8000-000000000002",
      title: "Yasal",
      sortOrder: 1,
      links: {
        create: [
          { label: "KVKK", url: "/kvkk", sortOrder: 0 },
          { label: "Gizlilik Politikası", url: "/gizlilik-politikasi", sortOrder: 1 },
          { label: "Mesafeli Satış Sözleşmesi", url: "/mesafeli-satis-sozlesmesi", sortOrder: 2 },
          { label: "Teslimat ve İade", url: "/teslimat-ve-iade", sortOrder: 3 },
        ],
      },
    },
  });
  console.log("✔ Footer link groups");

  // ---------- Order sequence (current year) ----------
  const year = new Date().getFullYear();
  await prisma.orderSequence.upsert({
    where: { year },
    update: {},
    create: { year, lastNo: 0 },
  });
  console.log(`✔ Order sequence ${year}`);
}

main()
  .then(() => {
    console.log("\nSeed completed.");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
