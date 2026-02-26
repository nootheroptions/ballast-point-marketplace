import 'server-only';

import { createCalendarIntegrationRepository } from '@/lib/repositories/calendar-integration.repo';
import { createCalendarService } from '@/lib/services/calendar';
import type { Booking, BookingParticipant, Service } from '@prisma/client';

type BookingWithDetails = Booking & {
  service: Pick<Service, 'name'>;
  participants: Pick<BookingParticipant, 'teamMemberId' | 'email' | 'name' | 'role'>[];
};

/**
 * Sync a new booking to the external calendars of participating team members
 * Called after a booking is created in the marketplace
 *
 * @param booking - The booking to sync
 * @returns Object mapping team member IDs to their external event IDs
 */
export async function syncBookingToExternalCalendars(
  booking: BookingWithDetails
): Promise<Record<string, string>> {
  const calendarIntegrationRepo = createCalendarIntegrationRepository();
  const eventIds: Record<string, string> = {};

  // Get team member IDs from participants (hosts/co-hosts)
  const teamMemberIds = booking.participants
    .filter((p) => p.teamMemberId && (p.role === 'HOST' || p.role === 'CO_HOST'))
    .map((p) => p.teamMemberId!)
    .filter(Boolean);

  if (teamMemberIds.length === 0) return eventIds;

  // Get calendar integrations for these team members
  const integrations = await calendarIntegrationRepo.findByTeamMemberIds(teamMemberIds);

  // Get invitee emails for the calendar event
  const inviteeEmails = booking.participants
    .filter((p) => p.role === 'INVITEE' && p.email)
    .map((p) => p.email!);

  // Create event in each external calendar
  const syncPromises = integrations.map(async (integration) => {
    try {
      // Check if token needs refresh
      let accessToken = integration.accessToken;
      if (integration.tokenExpiry && integration.tokenExpiry < new Date()) {
        if (!integration.refreshToken) {
          console.warn(
            `Cannot sync booking to calendar for team member ${integration.teamMemberId}: token expired`
          );
          return;
        }

        const calendarService = createCalendarService(integration.provider);
        const refreshResult = await calendarService.refreshAccessToken(integration.refreshToken);

        if (refreshResult.error || !refreshResult.data) {
          console.warn(
            `Failed to refresh token for calendar sync: ${refreshResult.error?.message}`
          );
          return;
        }

        await calendarIntegrationRepo.updateTokens(integration.id, {
          accessToken: refreshResult.data.accessToken,
          refreshToken: refreshResult.data.refreshToken,
          tokenExpiry: refreshResult.data.expiresAt,
        });

        accessToken = refreshResult.data.accessToken;
      }

      // Create the calendar event
      const calendarService = createCalendarService(integration.provider);
      const result = await calendarService.createEvent(accessToken, integration.calendarId, {
        summary: `Booking: ${booking.service.name}`,
        description: buildEventDescription(booking),
        startTime: booking.startTime,
        endTime: booking.endTime,
        timezone: booking.timezone,
        attendees: inviteeEmails,
      });

      if (result.error) {
        console.warn(
          `Failed to create calendar event for team member ${integration.teamMemberId}:`,
          result.error
        );
        return;
      }

      eventIds[integration.teamMemberId] = result.data?.eventId ?? '';
    } catch (error) {
      console.error(
        `Error syncing booking to calendar for team member ${integration.teamMemberId}:`,
        error
      );
    }
  });

  await Promise.all(syncPromises);

  return eventIds;
}

/**
 * Remove a booking from external calendars when cancelled
 *
 * @param booking - The cancelled booking
 * @param externalEventIds - Mapping of team member IDs to external event IDs
 */
export async function removeBookingFromExternalCalendars(
  booking: Booking,
  externalEventIds: Record<string, string>
): Promise<void> {
  const calendarIntegrationRepo = createCalendarIntegrationRepository();
  const teamMemberIds = Object.keys(externalEventIds);

  if (teamMemberIds.length === 0) return;

  const integrations = await calendarIntegrationRepo.findByTeamMemberIds(teamMemberIds);

  const deletePromises = integrations.map(async (integration) => {
    const eventId = externalEventIds[integration.teamMemberId];
    if (!eventId) return;

    try {
      let accessToken = integration.accessToken;
      if (integration.tokenExpiry && integration.tokenExpiry < new Date()) {
        if (!integration.refreshToken) return;

        const calendarService = createCalendarService(integration.provider);
        const refreshResult = await calendarService.refreshAccessToken(integration.refreshToken);

        if (refreshResult.error || !refreshResult.data) return;

        await calendarIntegrationRepo.updateTokens(integration.id, {
          accessToken: refreshResult.data.accessToken,
          refreshToken: refreshResult.data.refreshToken,
          tokenExpiry: refreshResult.data.expiresAt,
        });

        accessToken = refreshResult.data.accessToken;
      }

      const calendarService = createCalendarService(integration.provider);
      await calendarService.deleteEvent(accessToken, integration.calendarId, eventId);
    } catch (error) {
      console.error(
        `Error removing booking from calendar for team member ${integration.teamMemberId}:`,
        error
      );
    }
  });

  await Promise.all(deletePromises);
}

/**
 * Build a description for the calendar event
 */
function buildEventDescription(booking: BookingWithDetails): string {
  const invitees = booking.participants
    .filter((p) => p.role === 'INVITEE')
    .map((p) => p.name || p.email)
    .filter(Boolean);

  const lines: string[] = [
    `Service: ${booking.service.name}`,
    '',
    'Booked via Buildipedia Marketplace',
  ];

  if (invitees.length > 0) {
    lines.splice(1, 0, `Client: ${invitees.join(', ')}`);
  }

  if (booking.notes) {
    lines.push('', `Notes: ${booking.notes}`);
  }

  return lines.join('\n');
}
