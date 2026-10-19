-- Add username column (initially nullable for backfill)
ALTER TABLE "admin_users" ADD COLUMN "username" TEXT;

-- Backfill from existing emails (local-part), with uniqueness guard
WITH numbered AS (
  SELECT
    id,
    lower(split_part(email, '@', 1)) AS base,
    row_number() OVER (PARTITION BY lower(split_part(email, '@', 1)) ORDER BY "createdAt") AS rn
  FROM "admin_users"
  WHERE email IS NOT NULL
)
UPDATE "admin_users" a
SET "username" = CASE WHEN n.rn = 1 THEN n.base ELSE n.base || '-' || n.rn END
FROM numbered n
WHERE a.id = n.id;

-- Any remaining rows without a usable email get a fallback username
UPDATE "admin_users" SET "username" = 'admin_' || replace(id::text, '-', '') WHERE "username" IS NULL;

-- Enforce NOT NULL and uniqueness
ALTER TABLE "admin_users" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "admin_users_username_key" ON "admin_users"("username");

-- Email is now optional
ALTER TABLE "admin_users" ALTER COLUMN "email" DROP NOT NULL;