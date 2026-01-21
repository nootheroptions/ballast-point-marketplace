-- CreateTable
CREATE TABLE "provider_onboarding_progress" (
    "id" UUID NOT NULL,
    "current_step" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT,
    "slug" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "provider_onboarding_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "provider_onboarding_progress_user_id_key" ON "provider_onboarding_progress"("user_id");

-- AddForeignKey
ALTER TABLE "provider_onboarding_progress" ADD CONSTRAINT "provider_onboarding_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
