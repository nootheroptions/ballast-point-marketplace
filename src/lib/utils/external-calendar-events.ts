import 'server-only';

import { createCalendarIntegrationRepository } from '@/lib/repositories/calendar-integration.repo';
import { createCalendarService, type ExternalCalendarEvent } from '@/lib/services/calendar';
import type { Booking } from '@prisma/client';

/**
 * Converts external calendar events to a format compatible with the slot calculator
 * External events are treated as "virtual bookings" that block slots
 *
 * Note: This type mimics the Booking type with participants to be compatible
 * with the slot calculator's conflict checking logic
 */
export type ExternalEventAsBooking = {
  id: string;
  startTime: Date;
  endTime: Date;
  status: 'CONFIRMED';
  timezone: string;
  serviceId: string;
  notes: string | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isExternal: true;
  participants: { teamMemberId: string | null }[];
};

/**
 * Fetch external calendar events for team members and convert them to booking-like objects
 * These can be passed to the slot calculator to block out busy times
 *
 * @param teamMemberIds - IDs of team members to fetch events for
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @returns Array of external events formatted as bookings
 */
export async function fetchExternalEventsForTeamMembers(
  teamMemberIds: string[],
  startDate: Date,
  endDate: Date
): Promise<ExternalEventAsBooking[]> {
  if (teamMemberIds.length === 0) return [];

  const calendarIntegrationRepo = createCalendarIntegrationRepository();
  const integrations = await calendarIntegrationRepo.findByTeamMemberIds(teamMemberIds);

  if (integrations.length === 0) return [];

  const externalBookings: ExternalEventAsBooking[] = [];

  // Fetch events from each integration in parallel
  const fetchPromises = integrations.map(async (integration) => {
    try {
      // Check if token needs refresh
      let accessToken = integration.accessToken;
      if (integration.tokenExpiry && integration.tokenExpiry < new Date()) {
        if (!integration.refreshToken) {
          console.warn(
            `Calendar integration ${integration.id} has expired token and no refresh token`
          );
          return [];
        }

        const calendarService = createCalendarService(integration.provider);
        const refreshResult = await calendarService.refreshAccessToken(integration.refreshToken);

        if (refreshResult.error || !refreshResult.data) {
          console.warn(
            `Failed to refresh token for calendar integration ${integration.id}:`,
            refreshResult.error
          );
          return [];
        }

        // Update tokens in database
        await calendarIntegrationRepo.updateTokens(integration.id, {
          accessToken: refreshResult.data.accessToken,
          refreshToken: refreshResult.data.refreshToken,
          tokenExpiry: refreshResult.data.expiresAt,
        });

        accessToken = refreshResult.data.accessToken;
      }

      // Fetch events
      const calendarService = createCalendarService(integration.provider);
      const eventsResult = await calendarService.fetchEvents(accessToken, integration.calendarId, {
        startDate,
        endDate,
        statusFilter: ['confirmed'], // Only confirmed events block slots
      });

      if (eventsResult.error || !eventsResult.data) {
        console.warn(
          `Failed to fetch events for calendar integration ${integration.id}:`,
          eventsResult.error
        );
        // Update sync status with error
        await calendarIntegrationRepo.updateSyncStatus(
          integration.id,
          new Date(),
          eventsResult.error?.message
        );
        return [];
      }

      // Update sync status on success
      await calendarIntegrationRepo.updateSyncStatus(integration.id, new Date());

      // Convert events to booking-like format compatible with slot calculator
      const now = new Date();
      return eventsResult.data.map(
        (event: ExternalCalendarEvent): ExternalEventAsBooking => ({
          id: `external-${integration.provider}-${event.id}`,
          startTime: event.startTime,
          endTime: event.endTime,
          status: 'CONFIRMED',
          timezone: 'UTC',
          serviceId: 'external',
          notes: null,
          cancelledAt: null,
          createdAt: now,
          updatedAt: now,
          isExternal: true,
          participants: [{ teamMemberId: integration.teamMemberId }],
        })
      );
    } catch (error) {
      console.error(`Error fetching external events for integration ${integration.id}:`, error);
      return [];
    }
  });

  const results = await Promise.all(fetchPromises);

  for (const events of results) {
    externalBookings.push(...events);
  }

  return externalBookings;
}
