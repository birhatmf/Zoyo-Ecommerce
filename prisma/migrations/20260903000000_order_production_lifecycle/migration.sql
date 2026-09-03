-- Üretim hattı takibi (production lifecycle) alanları.
ALTER TABLE "orders"
  ADD COLUMN "productionStage" TEXT,
  ADD COLUMN "upholsteryDone" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "productionNote" TEXT;
