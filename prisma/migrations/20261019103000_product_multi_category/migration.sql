-- Ürün <-> Kategori ilişkisini çoka-çok'a çevir.
-- Mevcut products.categoryId değerleri join tablosuna taşınır, sonra kolon kaldırılır.

-- CreateTable
CREATE TABLE "_CategoryToProduct" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CategoryToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CategoryToProduct_B_index" ON "_CategoryToProduct"("B");

-- AddForeignKey
ALTER TABLE "_CategoryToProduct" ADD CONSTRAINT "_CategoryToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToProduct" ADD CONSTRAINT "_CategoryToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Veri taşıma: mevcut tek kategoriyi ilişkiye dönüştür
INSERT INTO "_CategoryToProduct" ("A", "B")
SELECT "categoryId", "id" FROM "products" WHERE "categoryId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_categoryId_fkey";

-- DropIndex
DROP INDEX "products_categoryId_idx";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "categoryId";
