import 'server-only';

import { env } from '@/lib/config/env';
import { formatInTimezone } from '@/lib/utils/timezone';
import type {
  CalendarAuthResult,
  CalendarOAuthTokens,
  CalendarService,
  CalendarServiceResult,
  CreateCalendarEventInput,
  ExternalCalendarEvent,
  FetchEventsOptions,
} from './types';

/**
 * Microsoft Outlook Calendar service using Microsoft Graph API
 *
 * API Reference:
 * - OAuth: https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow
 * - Calendar API: https://learn.microsoft.com/en-us/graph/api/resources/calendar
 *
 * Required OAuth scopes:
 * - Calendars.ReadWrite (read/write calendar events)
 * - offline_access (refresh tokens)
 * - User.Read (get user email)
 */

const MICROSOFT_AUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const MICROSOFT_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
const MICROSOFT_GRAPH_API = 'https://graph.microsoft.com/v1.0';

// OAuth scopes for calendar access
const SCOPES = ['Calendars.ReadWrite', 'offline_access', 'User.Read'].join(' ');

/**
 * Microsoft Graph API response types
 * Reference: https://learn.microsoft.com/en-us/graph/api/resources/event
 */
type MicrosoftCalendarEvent = {
  id: string;
  subject?: string;
  showAs: 'free' | 'tentative' | 'busy' | 'oof' | 'workingElsewhere' | 'unknown';
  isCancelled: boolean;
  isAllDay: boolean;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
};

type MicrosoftEventsListResponse = {
  value: MicrosoftCalendarEvent[];
  '@odata.nextLink'?: string;
};

type MicrosoftTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
};

type MicrosoftUserResponse = {
  mail?: string;
  userPrincipalName: string;
};

/**
 * Convert Microsoft showAs status to our status type
 */
function mapShowAsToStatus(showAs: MicrosoftCalendarEvent['showAs']): 'confirmed' | 'tentative' {
  switch (showAs) {
    case 'tentative':
      return 'tentative';
    case 'busy':
    case 'oof': // Out of office
    case 'workingElsewhere':
      return 'confirmed';
    default:
      return 'tentative';
  }
}

/**
 * Parse Microsoft Graph datetime to UTC Date
 * Microsoft returns datetimes in the event's timezone without offset
 */
function parseMicrosoftDateTime(dateTime: string, timeZone: string): Date {
  // Microsoft Graph returns datetime without offset, so we need to handle it
  // For simplicity, we parse as UTC and adjust - this works for most cases
  // A more robust solution would use a timezone library
  const date = new Date(dateTime);
  if (isNaN(date.getTime())) {
    // If direct parsing fails, try adding Z for UTC
    return new Date(dateTime + 'Z');
  }
  return date;
}

/**
 * Create a Microsoft Outlook Calendar service instance
 */
export function createOutlookCalendarService(): CalendarService {
  const clientId = env.MICROSOFT_CLIENT_ID;
  const clientSecret = env.MICROSOFT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Microsoft Calendar OAuth credentials not configured');
  }

  return {
    provider: 'OUTLOOK',

    getAuthUrl(redirectUri: string, state?: string): string {
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: SCOPES,
        response_mode: 'query',
      });

      if (state) {
        params.set('state', state);
      }

      return `${MICROSOFT_AUTH_URL}?${params.toString()}`;
    },

    async exchangeCodeForTokens(
      code: string,
      redirectUri: string
    ): Promise<CalendarServiceResult<CalendarAuthResult>> {
      try {
        // Exchange authorization code for tokens
        // Reference: https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow#request-an-access-token
        const tokenResponse = await fetch(MICROSOFT_TOKEN_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('Microsoft token exchange failed:', errorText);
          return {
            data: null,
            error: {
              code: 'TOKEN_EXCHANGE_FAILED',
              message: 'Failed to exchange authorization code for tokens',
            },
          };
        }

        const tokens: MicrosoftTokenResponse = await tokenResponse.json();

        // Fetch user email for calendar metadata
        // Reference: https://learn.microsoft.com/en-us/graph/api/user-get
        const userResponse = await fetch(`${MICROSOFT_GRAPH_API}/me`, {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        });

        let calendarEmail: string | undefined;
        if (userResponse.ok) {
          const userInfo: MicrosoftUserResponse = await userResponse.json();
          calendarEmail = userInfo.mail || userInfo.userPrincipalName;
        }

        return {
          data: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
            calendarId: 'primary', // We'll use the default calendar
            calendarEmail,
          },
          error: null,
        };
      } catch (error) {
        console.error('Microsoft token exchange error:', error);
        return {
          data: null,
          error: {
            code: 'TOKEN_EXCHANGE_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    },

    async refreshAccessToken(
      refreshToken: string
    ): Promise<CalendarServiceResult<CalendarOAuthTokens>> {
      try {
        // Refresh the access token
        // Reference: https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow#refresh-the-access-token
        const response = await fetch(MICROSOFT_TOKEN_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
            scope: SCOPES,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Microsoft token refresh failed:', errorText);
          return {
            data: null,
            error: {
              code: 'TOKEN_REFRESH_FAILED',
              message: 'Failed to refresh access token',
              requiresReauth: true,
            },
          };
        }

        const tokens: MicrosoftTokenResponse = await response.json();

        return {
          data: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || refreshToken,
            expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
          },
          error: null,
        };
      } catch (error) {
        console.error('Microsoft token refresh error:', error);
        return {
          data: null,
          error: {
            code: 'TOKEN_REFRESH_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    },

    async revokeToken(_accessToken: string): Promise<CalendarServiceResult<void>> {
      // Microsoft doesn't have a simple token revocation endpoint
      // The token will expire naturally, and users can revoke app access from their account settings
      // Reference: https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow
      return { data: undefined, error: null };
    },

    async fetchEvents(
      accessToken: string,
      _calendarId: string,
      options: FetchEventsOptions
    ): Promise<CalendarServiceResult<ExternalCalendarEvent[]>> {
      try {
        const events: ExternalCalendarEvent[] = [];
        let nextLink: string | undefined;

        // Fetch events with pagination using calendarView
        // Reference: https://learn.microsoft.com/en-us/graph/api/calendar-list-calendarview
        const startDateTime = options.startDate.toISOString();
        const endDateTime = options.endDate.toISOString();

        const url = `${MICROSOFT_GRAPH_API}/me/calendarView?startDateTime=${startDateTime}&endDateTime=${endDateTime}&$top=100&$select=id,subject,showAs,isCancelled,isAllDay,start,end`;

        do {
          const response = await fetch(nextLink || url, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Prefer: 'outlook.timezone="UTC"',
            },
          });

          if (!response.ok) {
            if (response.status === 401) {
              return {
                data: null,
                error: {
                  code: 'UNAUTHORIZED',
                  message: 'Access token expired or invalid',
                  requiresReauth: true,
                },
              };
            }
            const errorText = await response.text();
            console.error('Microsoft events fetch failed:', errorText);
            return {
              data: null,
              error: {
                code: 'FETCH_EVENTS_FAILED',
                message: 'Failed to fetch calendar events',
              },
            };
          }

          const data: MicrosoftEventsListResponse = await response.json();

          for (const event of data.value) {
            // Skip cancelled events
            if (event.isCancelled) continue;

            // Skip free time (not busy)
            if (event.showAs === 'free') continue;

            const status = mapShowAsToStatus(event.showAs);

            // Filter by status if specified
            if (options.statusFilter && !options.statusFilter.includes(status)) {
              continue;
            }

            const startTime = parseMicrosoftDateTime(event.start.dateTime, event.start.timeZone);
            const endTime = parseMicrosoftDateTime(event.end.dateTime, event.end.timeZone);

            events.push({
              id: event.id,
              summary: event.subject,
              status,
              startTime,
              endTime,
              isAllDay: event.isAllDay,
            });
          }

          nextLink = data['@odata.nextLink'];
        } while (nextLink);

        return { data: events, error: null };
      } catch (error) {
        console.error('Microsoft events fetch error:', error);
        return {
          data: null,
          error: {
            code: 'FETCH_EVENTS_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    },

    async createEvent(
      accessToken: string,
      _calendarId: string,
      event: CreateCalendarEventInput
    ): Promise<CalendarServiceResult<{ eventId: string }>> {
      try {
        // Create event in calendar
        // Reference: https://learn.microsoft.com/en-us/graph/api/calendar-post-events
        const response = await fetch(`${MICROSOFT_GRAPH_API}/me/events`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subject: event.summary,
            body: event.description
              ? {
                  contentType: 'text',
                  content: event.description,
                }
              : undefined,
            start: {
              dateTime: formatInTimezone(event.startTime, event.timezone, "yyyy-MM-dd'T'HH:mm:ss"),
              timeZone: event.timezone,
            },
            end: {
              dateTime: formatInTimezone(event.endTime, event.timezone, "yyyy-MM-dd'T'HH:mm:ss"),
              timeZone: event.timezone,
            },
            attendees: event.attendees?.map((email) => ({
              emailAddress: { address: email },
              type: 'required',
            })),
          }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            return {
              data: null,
              error: {
                code: 'UNAUTHORIZED',
                message: 'Access token expired or invalid',
                requiresReauth: true,
              },
            };
          }
          const errorText = await response.text();
          console.error('Microsoft event creation failed:', errorText);
          return {
            data: null,
            error: {
              code: 'CREATE_EVENT_FAILED',
              message: 'Failed to create calendar event',
            },
          };
        }

        const data = await response.json();
        return { data: { eventId: data.id }, error: null };
      } catch (error) {
        console.error('Microsoft event creation error:', error);
        return {
          data: null,
          error: {
            code: 'CREATE_EVENT_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    },

    async deleteEvent(
      accessToken: string,
      _calendarId: string,
      eventId: string
    ): Promise<CalendarServiceResult<void>> {
      try {
        // Delete event from calendar
        // Reference: https://learn.microsoft.com/en-us/graph/api/event-delete
        const response = await fetch(`${MICROSOFT_GRAPH_API}/me/events/${eventId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok && response.status !== 404) {
          // 404 is ok - event may already be deleted
          if (response.status === 401) {
            return {
              data: null,
              error: {
                code: 'UNAUTHORIZED',
                message: 'Access token expired or invalid',
                requiresReauth: true,
              },
            };
          }
          const errorText = await response.text();
          console.error('Microsoft event deletion failed:', errorText);
          return {
            data: null,
            error: {
              code: 'DELETE_EVENT_FAILED',
              message: 'Failed to delete calendar event',
            },
          };
        }

        return { data: undefined, error: null };
      } catch (error) {
        console.error('Microsoft event deletion error:', error);
        return {
          data: null,
          error: {
            code: 'DELETE_EVENT_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    },
  };
}
