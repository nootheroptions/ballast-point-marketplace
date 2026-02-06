'use server';

import { cookies } from 'next/headers';
import { createAction, createAuthenticatedAction } from '@/lib/auth/action-wrapper';
import {
  ForbiddenError,
  getProviderIdFromService,
  NotFoundError,
  requireProviderAccess,
} from '@/lib/auth/provider-authorization';
import { prisma } from '@/lib/db/prisma';
import { availabilityRepo } from '@/lib/repositories/availability.repo';
import { bookingRepo } from '@/lib/repositories/booking.repo';
import { createProviderProfileRepository } from '@/lib/repositories/provider-profile.repo';
import { createServiceRepository } from '@/lib/repositories/service.repo';
import {
  calculateAvailableSlots,
  isSlotAvailable,
  normalizeAvailabilitiesForService,
} from '@/lib/utils/availability-slots-calculator';
import {
  cancelBookingSchema,
  createBookingSchema,
  getAvailableSlotsSchema,
  getBookingsForServiceSchema,
  type CreateBookingData,
  type GetAvailableSlotsData,
  type GetBookingsForServiceData,
} from '@/lib/validations/booking';
import { CURRENT_TEAM_COOKIE } from '@/lib/constants';
import { Prisma } from '@prisma/client';
import { addMinutes } from 'date-fns';

/**
 * Get available time slots for a service (PUBLIC)
 * No authentication required - this is for the public booking flow
 */
export const getAvailableSlots = createAction(
  getAvailableSlotsSchema,
  async (data: GetAvailableSlotsData) => {
    const { serviceId, startDate, endDate, timezone } = data;

    try {
      // Get service to retrieve booking configuration
      const serviceRepo = createServiceRepository();
      const service = await serviceRepo.findById(serviceId);

      if (!service) {
        return {
          success: false,
          error: 'Service not found',
        };
      }

      // Get availability for this service
      // This includes both default team member availability and service-specific overrides
      const availabilitiesRaw = await availabilityRepo.findByService(serviceId);
      const availabilities = normalizeAvailabilitiesForService(availabilitiesRaw, serviceId);

      if (availabilities.length === 0) {
        return {
          success: true,
          data: [],
          message: 'No availability configured for this service',
        };
      }

      // Get existing bookings in the date range
      const existingBookings = await bookingRepo.findByServiceAndDateRange(
        serviceId,
        startDate,
        endDate
      );

      // Calculate available slots
      const slotsRaw = calculateAvailableSlots(availabilities, existingBookings, {
        startDate,
        endDate,
        slotDuration: service.slotDuration,
        slotBuffer: service.slotBuffer,
        advanceBookingMin: service.advanceBookingMin,
        advanceBookingMax: service.advanceBookingMax,
        clientTimezone: timezone,
      });

      // Public booking flow: multiple team members can produce the same time window.
      // Collapse duplicates so the invitee sees each time once.
      const uniqueByWindow = new Map<string, (typeof slotsRaw)[number]>();
      for (const slot of slotsRaw) {
        const key = `${slot.startTime.getTime()}-${slot.endTime.getTime()}`;
        if (!uniqueByWindow.has(key)) uniqueByWindow.set(key, slot);
      }
      const slots = Array.from(uniqueByWindow.values()).sort(
        (a, b) => a.startTime.getTime() - b.startTime.getTime()
      );

      return {
        success: true,
        data: slots,
      };
    } catch (error) {
      console.error('Error calculating available slots:', error);
      return {
        success: false,
        error: 'Failed to get available slots',
      };
    }
  }
);

/**
 * Create a booking (PUBLIC)
 * No authentication required - this is for the public booking flow
 * Includes race condition prevention
 */
export const createBooking = createAction(createBookingSchema, async (data: CreateBookingData) => {
  const { serviceId, startTime, endTime, timezone, name, email, notes } = data;

  try {
    // Get service to validate and get booking configuration
    const serviceRepo = createServiceRepository();
    const service = await serviceRepo.findById(serviceId);

    if (!service) {
      return {
        success: false,
        error: 'Service not found',
      };
    }

    // Validate advance booking constraints
    const now = new Date();
    const earliestBookingTime = addMinutes(now, service.advanceBookingMin);
    const latestBookingTime = addMinutes(now, service.advanceBookingMax);

    if (startTime < earliestBookingTime) {
      return {
        success: false,
        error: `Bookings must be made at least ${service.advanceBookingMin} minutes in advance`,
      };
    }

    if (startTime > latestBookingTime) {
      return {
        success: false,
        error: `Bookings cannot be made more than ${service.advanceBookingMax} minutes in advance`,
      };
    }

    if (startTime.getSeconds() !== 0 || startTime.getMilliseconds() !== 0) {
      return {
        success: false,
        error: 'Start time must be aligned to a full minute',
      };
    }

    // Server-derive end time from the service configuration.
    // Client-provided endTime (if present) must match, to avoid arbitrary-duration bookings.
    const expectedEndTime = addMinutes(startTime, service.slotDuration);
    if (endTime && endTime.getTime() !== expectedEndTime.getTime()) {
      return {
        success: false,
        error: 'Invalid booking duration for this service',
      };
    }

    // Create booking with race-condition prevention (transaction + DB constraint).
    const booking = await prisma.$transaction(
      async (tx) => {
        const availabilities = await availabilityRepo.findByService(serviceId, tx);
        const normalizedAvailabilities = normalizeAvailabilitiesForService(
          availabilities,
          serviceId
        );

        if (normalizedAvailabilities.length === 0) {
          throw new Error('No availability configured for this service');
        }

        const existingBookings = await bookingRepo.findByServiceAndDateRange(
          serviceId,
          startTime,
          expectedEndTime,
          tx
        );

        const available = isSlotAvailable(
          normalizedAvailabilities,
          existingBookings,
          startTime,
          expectedEndTime,
          {
            slotDuration: service.slotDuration,
            slotBuffer: service.slotBuffer,
          }
        );

        if (!available) {
          throw new Error('This time slot is no longer available');
        }

        return bookingRepo.create(
          {
            serviceId,
            startTime,
            endTime: expectedEndTime,
            timezone,
            notes: notes || undefined,
            participants: [
              {
                role: 'INVITEE',
                email,
                name,
              },
            ],
          },
          tx
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    return {
      success: true,
      data: booking,
      message: 'Booking created successfully',
    };
  } catch (error) {
    console.error('Error creating booking:', error);

    // Check if it's a conflict error
    if (
      error instanceof Error &&
      (error.message.includes('no longer available') ||
        error.message.includes('could not serialize access') ||
        error.message.toLowerCase().includes('bookings_no_overlap'))
    ) {
      return {
        success: false,
        error: 'This time slot is no longer available. Please select a different time.',
      };
    }

    if (error instanceof Error && error.message.includes('No availability configured')) {
      return {
        success: false,
        error: 'No availability configured for this service',
      };
    }

    return {
      success: false,
      error: 'Failed to create booking',
    };
  }
});

/**
 * Get all bookings for the current team's provider profile (AUTHENTICATED)
 * Returns all bookings across all services for the provider
 */
export const getProviderBookings = createAuthenticatedAction(async (user) => {
  // Get team ID from cookie
  const cookieStore = await cookies();
  const teamId = cookieStore.get(CURRENT_TEAM_COOKIE)?.value;

  if (!teamId) {
    return {
      success: false,
      error: 'No team selected. Please complete provider onboarding first.',
    };
  }

  // Resolve provider profile from team ID
  const providerRepo = createProviderProfileRepository();
  const providerProfile = await providerRepo.findByTeamId(teamId);

  if (!providerProfile) {
    return {
      success: false,
      error: 'Provider profile not found. Please complete provider onboarding first.',
    };
  }

  try {
    // Verify user is actually a member of this team
    await requireProviderAccess(user, providerProfile.id);

    // Get all bookings for this provider
    const bookings = await bookingRepo.findByProviderId(providerProfile.id);

    return bookings;
  } catch (error) {
    if (error instanceof ForbiddenError || error instanceof NotFoundError) {
      return {
        success: false,
        error: error.message,
      };
    }
    throw error;
  }
});

/**
 * Get bookings for a service (AUTHENTICATED)
 * Requires provider access to the service
 */
export const getBookingsForService = createAuthenticatedAction(
  getBookingsForServiceSchema,
  async (data: GetBookingsForServiceData, user) => {
    const { serviceId, status, startAfter, startBefore } = data;

    try {
      // Get service to find its provider ID
      const providerId = await getProviderIdFromService(serviceId);

      if (!providerId) {
        return {
          success: false,
          error: 'Service not found',
        };
      }

      // Verify user has access to this provider
      await requireProviderAccess(user, providerId);

      // Get bookings
      const bookings = await bookingRepo.findByService(serviceId, {
        status,
        startAfter,
        startBefore,
      });

      return {
        success: true,
        data: bookings,
      };
    } catch (error) {
      if (error instanceof ForbiddenError || error instanceof NotFoundError) {
        return {
          success: false,
          error: error.message,
        };
      }

      console.error('Error fetching bookings:', error);
      return {
        success: false,
        error: 'Failed to fetch bookings',
      };
    }
  }
);

/**
 * Cancel a booking (AUTHENTICATED)
 * Requires provider access to the service
 */
export const cancelBooking = createAuthenticatedAction(cancelBookingSchema, async (data, user) => {
  const { id } = data;

  try {
    // Get booking to find its service
    const booking = await bookingRepo.findById(id);

    if (!booking) {
      return {
        success: false,
        error: 'Booking not found',
      };
    }

    // Get provider ID from service
    const providerId = await getProviderIdFromService(booking.serviceId);

    if (!providerId) {
      return {
        success: false,
        error: 'Service not found',
      };
    }

    // Verify user has access to this provider
    await requireProviderAccess(user, providerId);

    // Cancel the booking
    const cancelledBooking = await bookingRepo.cancel(id);

    return {
      success: true,
      data: cancelledBooking,
      message: 'Booking cancelled successfully',
    };
  } catch (error) {
    if (error instanceof ForbiddenError || error instanceof NotFoundError) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error('Error cancelling booking:', error);
    return {
      success: false,
      error: 'Failed to cancel booking',
    };
  }
});
