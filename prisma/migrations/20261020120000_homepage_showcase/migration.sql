-- Ana sayfa "Vitrin" bölümü: admin'in seçtiği ürünler (sıralı).

-- CreateTable
CREATE TABLE "showcase_products" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "showcase_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "showcase_products_productId_key" ON "showcase_products"("productId");

-- CreateIndex
CREATE INDEX "showcase_products_sortOrder_idx" ON "showcase_products"("sortOrder");

-- AddForeignKey
ALTER TABLE "showcase_products" ADD CONSTRAINT "showcase_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
