-- SEO metadata alanları: ürün, kategori ve CMS sayfaları için.
ALTER TABLE "products" ADD COLUMN "seoTitle" TEXT, ADD COLUMN "seoDescription" TEXT;
ALTER TABLE "categories" ADD COLUMN "seoTitle" TEXT, ADD COLUMN "seoDescription" TEXT;
ALTER TABLE "cms_pages" ADD COLUMN "seoTitle" TEXT, ADD COLUMN "seoDescription" TEXT;
