/*
  Warnings:

  - You are about to drop the column `region_type` on the `provider_service_areas` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[provider_profile_id,country,jurisdiction,locality_name]` on the table `provider_service_areas` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `locality_name` to the `provider_service_areas` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "provider_service_areas_provider_profile_id_country_jurisdic_key";

-- AlterTable
ALTER TABLE "provider_service_areas" DROP COLUMN "region_type",
ADD COLUMN     "locality_name" VARCHAR(100) NOT NULL,
ADD COLUMN     "locality_type" VARCHAR(30);

-- CreateIndex
CREATE UNIQUE INDEX "provider_service_areas_provider_profile_id_country_jurisdic_key" ON "provider_service_areas"("provider_profile_id", "country", "jurisdiction", "locality_name");
