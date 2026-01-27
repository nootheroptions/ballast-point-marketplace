-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "BookingRole" AS ENUM ('HOST', 'CO_HOST', 'INVITEE');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('ACCEPTED', 'DECLINED', 'NO_SHOW');

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "advance_booking_max" INTEGER NOT NULL DEFAULT 43200,
ADD COLUMN     "advance_booking_min" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "slot_buffer" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "slot_duration" INTEGER NOT NULL DEFAULT 60;

-- CreateTable
CREATE TABLE "availabilities" (
    "id" UUID NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "team_member_id" UUID NOT NULL,
    "service_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "notes" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "service_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_participants" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "team_member_id" UUID,
    "user_id" UUID,
    "email" TEXT,
    "role" "BookingRole" NOT NULL,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'ACCEPTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "availabilities_team_member_id_dayOfWeek_idx" ON "availabilities"("team_member_id", "dayOfWeek");

-- CreateIndex
CREATE INDEX "availabilities_service_id_idx" ON "availabilities"("service_id");

-- CreateIndex
CREATE INDEX "bookings_service_id_start_time_idx" ON "bookings"("service_id", "start_time");

-- CreateIndex
CREATE INDEX "bookings_status_start_time_idx" ON "bookings"("status", "start_time");

-- CreateIndex
CREATE INDEX "booking_participants_booking_id_idx" ON "booking_participants"("booking_id");

-- CreateIndex
CREATE INDEX "booking_participants_team_member_id_idx" ON "booking_participants"("team_member_id");

-- CreateIndex
CREATE INDEX "booking_participants_user_id_idx" ON "booking_participants"("user_id");

-- CreateIndex
CREATE INDEX "booking_participants_email_idx" ON "booking_participants"("email");

-- AddForeignKey
ALTER TABLE "availabilities" ADD CONSTRAINT "availabilities_team_member_id_fkey" FOREIGN KEY ("team_member_id") REFERENCES "team_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availabilities" ADD CONSTRAINT "availabilities_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_participants" ADD CONSTRAINT "booking_participants_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_participants" ADD CONSTRAINT "booking_participants_team_member_id_fkey" FOREIGN KEY ("team_member_id") REFERENCES "team_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
