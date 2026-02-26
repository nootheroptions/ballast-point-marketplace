'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';
import { createAuthenticatedAction } from '@/lib/auth/action-wrapper';
import { CURRENT_TEAM_COOKIE } from '@/lib/constants';
import { createCalendarIntegrationRepository } from '@/lib/repositories/calendar-integration.repo';
import { createTeamMemberRepository } from '@/lib/repositories/team-member.repo';
import { createCalendarService } from '@/lib/services/calendar';
import type { CalendarIntegration } from '@prisma/client';

/**
 * Get the current user's calendar integration
 */
export const getMyCalendarIntegration = createAuthenticatedAction(async (user) => {
  const cookieStore = await cookies();
  const teamId = cookieStore.get(CURRENT_TEAM_COOKIE)?.value;

  if (!teamId) {
    return {
      success: false,
      error: 'No team selected. Please complete provider onboarding first.',
    };
  }

  try {
    const teamMemberRepo = createTeamMemberRepository();
    const teamMember = await teamMemberRepo.findByUserAndTeam(user.id, teamId);

    if (!teamMember) {
      return {
        success: false,
        error: 'Team member not found.',
      };
    }

    const calendarIntegrationRepo = createCalendarIntegrationRepository();
    const integration = await calendarIntegrationRepo.findByTeamMemberId(teamMember.id);

    return {
      success: true,
      data: integration
        ? {
            id: integration.id,
            provider: integration.provider,
            calendarEmail: integration.calendarEmail,
            lastSyncAt: integration.lastSyncAt,
            syncError: integration.syncError,
          }
        : null,
    };
  } catch (error) {
    console.error('Error fetching calendar integration:', error);
    return {
      success: false,
      error: 'Failed to fetch calendar integration',
    };
  }
});

/**
 * Disconnect and remove the current user's calendar integration
 */
export const disconnectCalendar = createAuthenticatedAction(async (user) => {
  const cookieStore = await cookies();
  const teamId = cookieStore.get(CURRENT_TEAM_COOKIE)?.value;

  if (!teamId) {
    return {
      success: false,
      error: 'No team selected.',
    };
  }

  try {
    const teamMemberRepo = createTeamMemberRepository();
    const teamMember = await teamMemberRepo.findByUserAndTeam(user.id, teamId);

    if (!teamMember) {
      return {
        success: false,
        error: 'Team member not found.',
      };
    }

    const calendarIntegrationRepo = createCalendarIntegrationRepository();
    const integration = await calendarIntegrationRepo.findByTeamMemberId(teamMember.id);

    if (!integration) {
      return {
        success: false,
        error: 'No calendar integration found.',
      };
    }

    // Revoke the OAuth token
    try {
      const calendarService = createCalendarService(integration.provider);
      await calendarService.revokeToken(integration.accessToken);
    } catch (revokeError) {
      // Log but don't fail - we still want to remove the integration
      console.warn('Failed to revoke calendar token:', revokeError);
    }

    // Delete the integration
    await calendarIntegrationRepo.delete(integration.id);

    return {
      success: true,
      message: 'Calendar disconnected successfully',
    };
  } catch (error) {
    console.error('Error disconnecting calendar:', error);
    return {
      success: false,
      error: 'Failed to disconnect calendar',
    };
  }
});

const fetchExternalEventsSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

/**
 * Fetch external calendar events for a date range
 * Used to check for conflicts when displaying availability
 */
export const fetchExternalCalendarEvents = createAuthenticatedAction(
  fetchExternalEventsSchema,
  async (data, user) => {
    const { startDate, endDate } = data;

    const cookieStore = await cookies();
    const teamId = cookieStore.get(CURRENT_TEAM_COOKIE)?.value;

    if (!teamId) {
      return {
        success: false,
        error: 'No team selected.',
      };
    }

    try {
      const teamMemberRepo = createTeamMemberRepository();
      const teamMember = await teamMemberRepo.findByUserAndTeam(user.id, teamId);

      if (!teamMember) {
        return {
          success: false,
          error: 'Team member not found.',
        };
      }

      const calendarIntegrationRepo = createCalendarIntegrationRepository();
      const integration = await calendarIntegrationRepo.findByTeamMemberId(teamMember.id);

      if (!integration) {
        return {
          success: true,
          data: [], // No integration = no external events
        };
      }

      // Check if token needs refresh
      let accessToken = integration.accessToken;
      if (integration.tokenExpiry && integration.tokenExpiry < new Date()) {
        // Token expired, try to refresh
        if (!integration.refreshToken) {
          // Can't refresh, mark integration as having an error
          await calendarIntegrationRepo.updateSyncStatus(
            integration.id,
            new Date(),
            'Token expired and no refresh token available. Please reconnect your calendar.'
          );
          return {
            success: false,
            error: 'Calendar token expired. Please reconnect your calendar.',
          };
        }

        const calendarService = createCalendarService(integration.provider);
        const refreshResult = await calendarService.refreshAccessToken(integration.refreshToken);

        if (refreshResult.error || !refreshResult.data) {
          await calendarIntegrationRepo.updateSyncStatus(
            integration.id,
            new Date(),
            refreshResult.error?.message ?? 'Failed to refresh token'
          );
          return {
            success: false,
            error: 'Failed to refresh calendar token. Please reconnect your calendar.',
          };
        }

        // Update tokens in database
        await calendarIntegrationRepo.updateTokens(integration.id, {
          accessToken: refreshResult.data.accessToken,
          refreshToken: refreshResult.data.refreshToken,
          tokenExpiry: refreshResult.data.expiresAt,
        });

        accessToken = refreshResult.data.accessToken;
      }

      // Fetch events from external calendar
      const calendarService = createCalendarService(integration.provider);
      const eventsResult = await calendarService.fetchEvents(accessToken, integration.calendarId, {
        startDate,
        endDate,
        statusFilter: ['confirmed'], // Only confirmed events block slots
      });

      if (eventsResult.error) {
        // Update sync status with error
        await calendarIntegrationRepo.updateSyncStatus(
          integration.id,
          new Date(),
          eventsResult.error.message
        );

        if (eventsResult.error.requiresReauth) {
          return {
            success: false,
            error: 'Calendar authorization expired. Please reconnect your calendar.',
          };
        }

        return {
          success: false,
          error: 'Failed to fetch calendar events',
        };
      }

      // Update sync status on success
      await calendarIntegrationRepo.updateSyncStatus(integration.id, new Date());

      return {
        success: true,
        data: eventsResult.data ?? [],
      };
    } catch (error) {
      console.error('Error fetching external calendar events:', error);
      return {
        success: false,
        error: 'Failed to fetch calendar events',
      };
    }
  }
);

/**
 * Get a valid access token for a calendar integration, refreshing if needed
 * Internal helper used by other services
 */
export async function getValidCalendarToken(
  integration: CalendarIntegration
): Promise<{ accessToken: string } | { error: string }> {
  const calendarIntegrationRepo = createCalendarIntegrationRepository();

  // Check if token needs refresh
  if (integration.tokenExpiry && integration.tokenExpiry < new Date()) {
    if (!integration.refreshToken) {
      return { error: 'Token expired and no refresh token available' };
    }

    const calendarService = createCalendarService(integration.provider);
    const refreshResult = await calendarService.refreshAccessToken(integration.refreshToken);

    if (refreshResult.error || !refreshResult.data) {
      return { error: refreshResult.error?.message ?? 'Failed to refresh token' };
    }

    // Update tokens in database
    await calendarIntegrationRepo.updateTokens(integration.id, {
      accessToken: refreshResult.data.accessToken,
      refreshToken: refreshResult.data.refreshToken,
      tokenExpiry: refreshResult.data.expiresAt,
    });

    return { accessToken: refreshResult.data.accessToken };
  }

  return { accessToken: integration.accessToken };
}
