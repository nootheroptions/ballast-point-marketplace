-- AlterTable
ALTER TABLE "provider_profiles"
ADD COLUMN "image_urls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Backfill from legacy logo_url when available
UPDATE "provider_profiles"
SET "image_urls" = ARRAY["logo_url"]
WHERE "logo_url" IS NOT NULL AND "logo_url" <> '';

-- AlterTable
ALTER TABLE "services"
ADD COLUMN "image_urls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
