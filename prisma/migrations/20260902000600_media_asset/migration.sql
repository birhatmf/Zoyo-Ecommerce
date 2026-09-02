-- Merkezi medya kayıt tablosu.
CREATE TABLE "media_assets" (
  "id" UUID NOT NULL,
  "url" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "refs" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "media_assets_url_key" ON "media_assets"("url");
CREATE UNIQUE INDEX "media_assets_fileName_key" ON "media_assets"("fileName");
CREATE INDEX "media_assets_createdAt_idx" ON "media_assets"("createdAt");
