/*
  Warnings:

  - Added the required column `delivery_mode` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lead_time_days` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_cents` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `template_data` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `template_key` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `turnaround_days` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TemplateKey" AS ENUM ('CONSULTATION', 'FEASIBILITY', 'CONCEPT_DESIGN', 'PLANNING_APPROVALS', 'REVIEW');

-- CreateEnum
CREATE TYPE "DeliveryMode" AS ENUM ('REMOTE', 'ON_SITE', 'BOTH');

-- CreateEnum
CREATE TYPE "BundlePricingType" AS ENUM ('SUM_OF_PARTS', 'FIXED');

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "assumptions" TEXT,
ADD COLUMN     "client_responsibilities" JSONB,
ADD COLUMN     "coverage_package_key" TEXT,
ADD COLUMN     "delivery_mode" "DeliveryMode" NOT NULL,
ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lead_time_days" INTEGER NOT NULL,
ADD COLUMN     "positioning" TEXT,
ADD COLUMN     "price_cents" INTEGER NOT NULL,
ADD COLUMN     "template_data" JSONB NOT NULL,
ADD COLUMN     "template_key" "TemplateKey" NOT NULL,
ADD COLUMN     "turnaround_days" INTEGER NOT NULL,
ALTER COLUMN "advance_booking_max" DROP DEFAULT,
ALTER COLUMN "advance_booking_min" DROP DEFAULT,
ALTER COLUMN "slot_buffer" DROP DEFAULT,
ALTER COLUMN "slot_duration" DROP DEFAULT;

-- CreateTable
CREATE TABLE "service_add_ons" (
    "id" UUID NOT NULL,
    "add_on_key" TEXT NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "turnaround_impact_days" INTEGER NOT NULL DEFAULT 0,
    "service_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_add_ons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bundles" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pricing_type" "BundlePricingType" NOT NULL,
    "price_cents" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "positioning" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "provider_profile_id" UUID NOT NULL,

    CONSTRAINT "bundles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bundle_services" (
    "id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "bundle_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bundle_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bundle_add_ons" (
    "id" UUID NOT NULL,
    "add_on_key" TEXT NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "turnaround_impact_days" INTEGER NOT NULL DEFAULT 0,
    "bundle_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bundle_add_ons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_add_ons_service_id_add_on_key_key" ON "service_add_ons"("service_id", "add_on_key");

-- CreateIndex
CREATE UNIQUE INDEX "bundles_provider_profile_id_slug_key" ON "bundles"("provider_profile_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "bundle_services_bundle_id_service_id_key" ON "bundle_services"("bundle_id", "service_id");

-- CreateIndex
CREATE UNIQUE INDEX "bundle_add_ons_bundle_id_add_on_key_key" ON "bundle_add_ons"("bundle_id", "add_on_key");

-- AddForeignKey
ALTER TABLE "service_add_ons" ADD CONSTRAINT "service_add_ons_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundles" ADD CONSTRAINT "bundles_provider_profile_id_fkey" FOREIGN KEY ("provider_profile_id") REFERENCES "provider_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundle_services" ADD CONSTRAINT "bundle_services_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "bundles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundle_services" ADD CONSTRAINT "bundle_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundle_add_ons" ADD CONSTRAINT "bundle_add_ons_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "bundles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
