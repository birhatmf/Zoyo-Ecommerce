-- CreateTable
CREATE TABLE "hero_slides" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "ctaLabel" TEXT,
    "ctaUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_slides_pkey" PRIMARY KEY ("id")
);
