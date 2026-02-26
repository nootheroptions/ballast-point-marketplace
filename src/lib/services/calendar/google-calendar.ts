import 'server-only';

import { env } from '@/lib/config/env';
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
 * Google Calendar API service
 *
 * API Reference:
 * - OAuth: https://developers.google.com/identity/protocols/oauth2/web-server
 * - Calendar API: https://developers.google.com/calendar/api/v3/reference
 *
 * Required OAuth scopes:
 * - https://www.googleapis.com/auth/calendar.events (read/write events)
 * - https://www.googleapis.com/auth/calendar.readonly (list calendars)
 */

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke';
const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

// OAuth scopes for calendar access
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

/**
 * Google Calendar API response types
 * Reference: https://developers.google.com/calendar/api/v3/reference/events
 */
type GoogleCalendarEvent = {
  id: string;
  summary?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
};

type GoogleEventsListResponse = {
  items: GoogleCalendarEvent[];
  nextPageToken?: string;
};

type GoogleTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
};

type GoogleUserInfoResponse = {
  email: string;
};

/**
 * Create a Google Calendar service instance
 */
export function createGoogleCalendarService(): CalendarService {
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Google Calendar OAuth credentials not configured');
  }

  return {
    provider: 'GOOGLE',

    getAuthUrl(redirectUri: string, state?: string): string {
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: SCOPES,
        access_type: 'offline', // Required to get refresh token
        prompt: 'consent', // Force consent to ensure refresh token is returned
      });

      if (state) {
        params.set('state', state);
      }

      return `${GOOGLE_AUTH_URL}?${params.toString()}`;
    },

    async exchangeCodeForTokens(
      code: string,
      redirectUri: string
    ): Promise<CalendarServiceResult<CalendarAuthResult>> {
      try {
        // Exchange authorization code for tokens
        // Reference: https://developers.google.com/identity/protocols/oauth2/web-server#exchange-authorization-code
        const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
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
          console.error('Google token exchange failed:', errorText);
          return {
            data: null,
            error: {
              code: 'TOKEN_EXCHANGE_FAILED',
              message: 'Failed to exchange authorization code for tokens',
            },
          };
        }

        const tokens: GoogleTokenResponse = await tokenResponse.json();

        // Fetch user email for calendar metadata
        // Reference: https://developers.google.com/identity/protocols/oauth2/openid-connect#obtaininguserprofileinformation
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        });

        let calendarEmail: string | undefined;
        if (userInfoResponse.ok) {
          const userInfo: GoogleUserInfoResponse = await userInfoResponse.json();
          calendarEmail = userInfo.email;
        }

        return {
          data: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
            calendarId: 'primary', // Google's default calendar
            calendarEmail,
          },
          error: null,
        };
      } catch (error) {
        console.error('Google token exchange error:', error);
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
        // Reference: https://developers.google.com/identity/protocols/oauth2/web-server#offline
        const response = await fetch(GOOGLE_TOKEN_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Google token refresh failed:', errorText);
          return {
            data: null,
            error: {
              code: 'TOKEN_REFRESH_FAILED',
              message: 'Failed to refresh access token',
              requiresReauth: true,
            },
          };
        }

        const tokens: GoogleTokenResponse = await response.json();

        return {
          data: {
            accessToken: tokens.access_token,
            // Google may return a new refresh token
            refreshToken: tokens.refresh_token || refreshToken,
            expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
          },
          error: null,
        };
      } catch (error) {
        console.error('Google token refresh error:', error);
        return {
          data: null,
          error: {
            code: 'TOKEN_REFRESH_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    },

    async revokeToken(accessToken: string): Promise<CalendarServiceResult<void>> {
      try {
        // Revoke the token
        // Reference: https://developers.google.com/identity/protocols/oauth2/web-server#tokenrevoke
        const response = await fetch(`${GOOGLE_REVOKE_URL}?token=${accessToken}`, {
          method: 'POST',
        });

        if (!response.ok) {
          // Token may already be revoked, which is fine
          console.warn('Google token revocation returned non-OK status');
        }

        return { data: undefined, error: null };
      } catch (error) {
        console.error('Google token revocation error:', error);
        // Don't fail on revocation errors - the token may already be invalid
        return { data: undefined, error: null };
      }
    },

    async fetchEvents(
      accessToken: string,
      calendarId: string,
      options: FetchEventsOptions
    ): Promise<CalendarServiceResult<ExternalCalendarEvent[]>> {
      try {
        const events: ExternalCalendarEvent[] = [];
        let pageToken: string | undefined;

        // Fetch events with pagination
        // Reference: https://developers.google.com/calendar/api/v3/reference/events/list
        do {
          const params = new URLSearchParams({
            timeMin: options.startDate.toISOString(),
            timeMax: options.endDate.toISOString(),
            singleEvents: 'true', // Expand recurring events
            orderBy: 'startTime',
            maxResults: '250', // Max allowed by API
          });

          if (pageToken) {
            params.set('pageToken', pageToken);
          }

          const response = await fetch(
            `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

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
            console.error('Google events fetch failed:', errorText);
            return {
              data: null,
              error: {
                code: 'FETCH_EVENTS_FAILED',
                message: 'Failed to fetch calendar events',
              },
            };
          }

          const data: GoogleEventsListResponse = await response.json();

          for (const event of data.items) {
            // Skip cancelled events
            if (event.status === 'cancelled') continue;

            // Filter by status if specified
            if (options.statusFilter && !options.statusFilter.includes(event.status)) {
              continue;
            }

            const isAllDay = !event.start.dateTime;
            let startTime: Date;
            let endTime: Date;

            if (isAllDay) {
              // All-day events have date strings (YYYY-MM-DD)
              // Treat as blocking the entire day in UTC
              startTime = new Date(event.start.date + 'T00:00:00Z');
              endTime = new Date(event.end.date + 'T00:00:00Z');
            } else {
              startTime = new Date(event.start.dateTime!);
              endTime = new Date(event.end.dateTime!);
            }

            events.push({
              id: event.id,
              summary: event.summary,
              status: event.status,
              startTime,
              endTime,
              isAllDay,
            });
          }

          pageToken = data.nextPageToken;
        } while (pageToken);

        return { data: events, error: null };
      } catch (error) {
        console.error('Google events fetch error:', error);
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
      calendarId: string,
      event: CreateCalendarEventInput
    ): Promise<CalendarServiceResult<{ eventId: string }>> {
      try {
        // Create event in calendar
        // Reference: https://developers.google.com/calendar/api/v3/reference/events/insert
        const response = await fetch(
          `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              summary: event.summary,
              description: event.description,
              start: {
                dateTime: event.startTime.toISOString(),
                timeZone: event.timezone,
              },
              end: {
                dateTime: event.endTime.toISOString(),
                timeZone: event.timezone,
              },
              attendees: event.attendees?.map((email) => ({ email })),
            }),
          }
        );

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
          console.error('Google event creation failed:', errorText);
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
        console.error('Google event creation error:', error);
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
      calendarId: string,
      eventId: string
    ): Promise<CalendarServiceResult<void>> {
      try {
        // Delete event from calendar
        // Reference: https://developers.google.com/calendar/api/v3/reference/events/delete
        const response = await fetch(
          `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

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
          console.error('Google event deletion failed:', errorText);
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
        console.error('Google event deletion error:', error);
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
