-- Storefront UI metinlerini CMS'den yönetmek için.
CREATE TABLE "storefront_texts" (
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "storefront_texts_pkey" PRIMARY KEY ("key")
);
