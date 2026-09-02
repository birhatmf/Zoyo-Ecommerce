-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('INDIVIDUAL', 'CORPORATE');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "invoiceAddress" TEXT,
ADD COLUMN     "invoiceType" "InvoiceType" NOT NULL DEFAULT 'INDIVIDUAL',
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "taxNumber" TEXT,
ADD COLUMN     "taxOffice" TEXT,
ADD COLUMN     "tcNumber" TEXT;

-- CreateTable
CREATE TABLE "order_notes" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_notes_orderId_idx" ON "order_notes"("orderId");

-- AddForeignKey
ALTER TABLE "order_notes" ADD CONSTRAINT "order_notes_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
