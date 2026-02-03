/*
  Warnings:

  - A unique constraint covering the columns `[provider_profile_id,slug]` on the table `services` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "services" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "services_provider_profile_id_slug_key" ON "services"("provider_profile_id", "slug");
