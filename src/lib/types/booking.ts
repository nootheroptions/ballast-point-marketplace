import type { Booking, BookingParticipant, Service, TeamMember, UserProfile } from '@prisma/client';

/**
 * Booking participant with optional team member and user relations
 */
export type BookingParticipantWithRelations = BookingParticipant & {
  teamMember:
    | (TeamMember & {
        user: UserProfile;
      })
    | null;
};

/**
 * Booking with service and participants including nested relations
 * Matches the shape returned by bookingRepo.findByProviderId
 */
export type BookingWithDetails = Booking & {
  service: Service;
  participants: BookingParticipantWithRelations[];
};
