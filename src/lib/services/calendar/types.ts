import 'server-only';

import type { CalendarProvider } from '@prisma/client';

/**
 * Represents an event from an external calendar (Google/Outlook)
 * Used to block availability slots during slot calculation
 */
export type ExternalCalendarEvent = {
  /** External calendar's event ID */
  id: string;
  /** Event start time in UTC */
  startTime: Date;
  /** Event end time in UTC */
  endTime: Date;
  /** Event title/summary (optional, for debugging) */
  summary?: string;
  /** Whether this is an all-day event */
  isAllDay: boolean;
  /** Event status - only 'confirmed' events block slots */
  status: 'confirmed' | 'tentative' | 'cancelled';
};

/**
 * OAuth tokens received from calendar providers
 */
export type CalendarOAuthTokens = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
};

/**
 * Calendar metadata returned after OAuth authorization
 */
export type CalendarMetadata = {
  calendarId: string;
  calendarEmail?: string;
};

/**
 * Result of OAuth authorization
 */
export type CalendarAuthResult = CalendarOAuthTokens & CalendarMetadata;

/**
 * Options for fetching calendar events
 */
export type FetchEventsOptions = {
  /** Start of date range (inclusive) */
  startDate: Date;
  /** End of date range (exclusive) */
  endDate: Date;
  /** Only fetch events with these statuses */
  statusFilter?: ('confirmed' | 'tentative')[];
};

/**
 * Service result wrapper following existing patterns
 */
export type CalendarServiceResult<T> = {
  data: T | null;
  error: CalendarServiceError | null;
};

/**
 * Calendar service error type
 */
export type CalendarServiceError = {
  code: string;
  message: string;
  /** Whether the error requires re-authentication */
  requiresReauth?: boolean;
};

/**
 * Calendar service interface
 * Each provider (Google, Outlook) implements this interface
 */
export type CalendarService = {
  /** Provider type for this service */
  provider: CalendarProvider;

  /**
   * Generate OAuth authorization URL
   * @param redirectUri - The callback URL after authorization
   * @param state - Optional state parameter for CSRF protection
   */
  getAuthUrl(redirectUri: string, state?: string): string;

  /**
   * Exchange authorization code for tokens
   * @param code - Authorization code from OAuth callback
   * @param redirectUri - Must match the redirect URI used in getAuthUrl
   */
  exchangeCodeForTokens(
    code: string,
    redirectUri: string
  ): Promise<CalendarServiceResult<CalendarAuthResult>>;

  /**
   * Refresh an expired access token
   * @param refreshToken - The refresh token from initial authorization
   */
  refreshAccessToken(refreshToken: string): Promise<CalendarServiceResult<CalendarOAuthTokens>>;

  /**
   * Revoke OAuth tokens (disconnect integration)
   * @param accessToken - The access token to revoke
   */
  revokeToken(accessToken: string): Promise<CalendarServiceResult<void>>;

  /**
   * Fetch calendar events for a date range
   * @param accessToken - Valid access token
   * @param calendarId - Calendar ID to fetch events from
   * @param options - Date range and filters
   */
  fetchEvents(
    accessToken: string,
    calendarId: string,
    options: FetchEventsOptions
  ): Promise<CalendarServiceResult<ExternalCalendarEvent[]>>;

  /**
   * Create an event in the external calendar
   * @param accessToken - Valid access token
   * @param calendarId - Calendar ID to create event in
   * @param event - Event details
   */
  createEvent(
    accessToken: string,
    calendarId: string,
    event: CreateCalendarEventInput
  ): Promise<CalendarServiceResult<{ eventId: string }>>;

  /**
   * Delete an event from the external calendar
   * @param accessToken - Valid access token
   * @param calendarId - Calendar ID containing the event
   * @param eventId - Event ID to delete
   */
  deleteEvent(
    accessToken: string,
    calendarId: string,
    eventId: string
  ): Promise<CalendarServiceResult<void>>;
};

/**
 * Input for creating a calendar event
 */
export type CreateCalendarEventInput = {
  summary: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
  /** Attendee emails to invite */
  attendees?: string[];
};
