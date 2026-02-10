-- Rename provider profile image field to match new domain language
ALTER TABLE "provider_profiles"
RENAME COLUMN "logo_url" TO "profile_url";
