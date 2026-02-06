-- CreateTable
CREATE TABLE "provider_licenses" (
    "id" UUID NOT NULL,
    "country" VARCHAR(2) NOT NULL,
    "jurisdiction" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "provider_profile_id" UUID NOT NULL,

    CONSTRAINT "provider_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_service_areas" (
    "id" UUID NOT NULL,
    "country" VARCHAR(2) NOT NULL,
    "jurisdiction" VARCHAR(50) NOT NULL,
    "region_type" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "provider_profile_id" UUID NOT NULL,

    CONSTRAINT "provider_service_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_local_experiences" (
    "id" UUID NOT NULL,
    "country" VARCHAR(2) NOT NULL,
    "jurisdiction" VARCHAR(50) NOT NULL,
    "locality_name" TEXT NOT NULL,
    "locality_type" VARCHAR(30),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "provider_profile_id" UUID NOT NULL,

    CONSTRAINT "provider_local_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "provider_licenses_country_idx" ON "provider_licenses"("country");

-- CreateIndex
CREATE UNIQUE INDEX "provider_licenses_provider_profile_id_country_jurisdiction_key" ON "provider_licenses"("provider_profile_id", "country", "jurisdiction");

-- CreateIndex
CREATE INDEX "provider_service_areas_country_jurisdiction_idx" ON "provider_service_areas"("country", "jurisdiction");

-- CreateIndex
CREATE UNIQUE INDEX "provider_service_areas_provider_profile_id_country_jurisdic_key" ON "provider_service_areas"("provider_profile_id", "country", "jurisdiction", "region_type");

-- CreateIndex
CREATE INDEX "provider_local_experiences_country_jurisdiction_idx" ON "provider_local_experiences"("country", "jurisdiction");

-- CreateIndex
CREATE INDEX "provider_local_experiences_is_active_idx" ON "provider_local_experiences"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "provider_local_experiences_provider_profile_id_country_juri_key" ON "provider_local_experiences"("provider_profile_id", "country", "jurisdiction", "locality_name");

-- AddForeignKey
ALTER TABLE "provider_licenses" ADD CONSTRAINT "provider_licenses_provider_profile_id_fkey" FOREIGN KEY ("provider_profile_id") REFERENCES "provider_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_service_areas" ADD CONSTRAINT "provider_service_areas_provider_profile_id_fkey" FOREIGN KEY ("provider_profile_id") REFERENCES "provider_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_local_experiences" ADD CONSTRAINT "provider_local_experiences_provider_profile_id_fkey" FOREIGN KEY ("provider_profile_id") REFERENCES "provider_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
