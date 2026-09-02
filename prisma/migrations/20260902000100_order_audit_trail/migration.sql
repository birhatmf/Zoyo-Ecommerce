-- Orders tablosuna audit trail alanları.
ALTER TABLE "orders"
  ADD COLUMN "lastEditedById" UUID,
  ADD COLUMN "lastEditedAt" TIMESTAMP(3);
