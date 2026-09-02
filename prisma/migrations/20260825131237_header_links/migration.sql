-- CreateTable
CREATE TABLE "header_links" (
    "id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "header_links_pkey" PRIMARY KEY ("id")
);
