-- Üretim hattı takibi (production lifecycle).
-- Enum tipi oluşturulur; kolon bu enum ile eklenir.
CREATE TYPE "ProductionStage" AS ENUM (
  'QUEUED',
  'CUTTING',
  'ASSEMBLY',
  'PAINTING',
  'UPHOLSTERY',
  'READY',
  'SHIPPED'
);

ALTER TABLE "orders"
  ADD COLUMN "productionStage" "ProductionStage",
  ADD COLUMN "upholsteryDone" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "productionNote" TEXT;
