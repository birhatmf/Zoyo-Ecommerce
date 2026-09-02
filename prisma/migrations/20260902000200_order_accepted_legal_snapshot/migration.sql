-- Sipariş oluşturulurken kabul edilen yasal metin versiyonlarını saklamak için.
ALTER TABLE "orders"
  ADD COLUMN "acceptedLegal" JSONB;
