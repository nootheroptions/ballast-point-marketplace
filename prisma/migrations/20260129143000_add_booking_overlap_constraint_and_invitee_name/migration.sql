-- Add invitee display name to booking participants
ALTER TABLE "booking_participants" ADD COLUMN "name" TEXT;

-- Prevent overlapping confirmed/completed bookings per service
-- (public booking flow can be hit concurrently; enforce at the DB level)
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "bookings"
ADD CONSTRAINT "bookings_no_overlap"
EXCLUDE USING gist (
  "service_id" WITH =,
  tsrange("start_time", "end_time", '[)') WITH &&
)
WHERE ("status" IN ('CONFIRMED', 'COMPLETED'));

