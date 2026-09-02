-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'APPROVED', 'PAYMENT_PENDING', 'PAID', 'IN_PRODUCTION', 'READY', 'SHIPPED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CmsPageType" AS ENUM ('LEGAL', 'CORPORATE', 'CUSTOM');

-- CreateTable
CREATE TABLE "admin_users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "discountPrice" DECIMAL(12,2),
    "categoryId" UUID,
    "material" TEXT,
    "dimensions" TEXT,
    "productionTime" TEXT,
    "deliveryInformation" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isCover" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerFirstName" TEXT NOT NULL,
    "customerLastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phoneNormalized" TEXT NOT NULL,
    "email" TEXT,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "customerNote" TEXT,
    "adminNote" TEXT,
    "acceptedTerms" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "productId" UUID,
    "productName" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_sequences" (
    "year" INTEGER NOT NULL,
    "lastNo" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "order_sequences_pkey" PRIMARY KEY ("year")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" UUID NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_pages" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "CmsPageType" NOT NULL DEFAULT 'CUSTOM',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_content" (
    "id" TEXT NOT NULL DEFAULT 'homepage',
    "heroTitle" TEXT,
    "heroSubtitle" TEXT,
    "heroDescription" TEXT,
    "heroImageDesktop" TEXT,
    "heroImageMobile" TEXT,
    "heroCtaLabel" TEXT,
    "heroCtaUrl" TEXT,
    "heroCtaSecondaryLabel" TEXT,
    "heroCtaSecondaryUrl" TEXT,
    "heroAlignment" TEXT NOT NULL DEFAULT 'left',
    "heroActive" BOOLEAN NOT NULL DEFAULT true,
    "storyTitle" TEXT,
    "storyDescription" TEXT,
    "storyImage" TEXT,
    "customProductionTitle" TEXT,
    "customProductionDescription" TEXT,
    "customProductionButtonLabel" TEXT,
    "customProductionButtonUrl" TEXT,
    "customProductionType" TEXT NOT NULL DEFAULT 'WHATSAPP',
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "homepage_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_link_groups" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "footer_link_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_links" (
    "id" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "footer_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_productCode_key" ON "products"("productCode");

-- CreateIndex
CREATE INDEX "products_status_featured_idx" ON "products"("status", "featured");

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- CreateIndex
CREATE INDEX "product_images_productId_idx" ON "product_images"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "cms_pages_slug_key" ON "cms_pages"("slug");

-- CreateIndex
CREATE INDEX "footer_links_groupId_idx" ON "footer_links"("groupId");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "footer_links" ADD CONSTRAINT "footer_links_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "footer_link_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
