import { format } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

/**
 * Add days to a UTC date without timezone conversion
 * @param date - UTC Date object
 * @param days - Number of days to add (can be negative)
 * @returns New UTC Date with days added
 */
export function addUtcDays(date: Date, days: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));
}

/**
 * Convert a date key string to a UTC Date object
 * @param dateKey - Date string in YYYY-MM-DD format (e.g., "2024-01-15")
 * @returns UTC Date object set to midnight
 */
export function dateKeyToUtcDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1));
}

/**
 * Convert a UTC Date to a date key string
 * @param date - UTC Date object
 * @returns Date string in YYYY-MM-DD format (e.g., "2024-01-15")
 */
export function utcDateToDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Convert a time string to total minutes since midnight
 * @param timeString - Time in HH:mm format (e.g., "09:30")
 * @returns Total minutes (e.g., 570 for "09:30")
 */
export function timeStringToMinutes(timeString: string): number {
  const [hoursRaw, minutesRaw] = timeString.split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  const safeHours = Number.isFinite(hours) ? hours : 0;
  const safeMinutes = Number.isFinite(minutes) ? minutes : 0;
  return safeHours * 60 + safeMinutes;
}

/**
 * Convert a time string (HH:mm) and date to a UTC Date object
 * @param timeString - Time in HH:mm format (e.g., "09:00")
 * @param date - The date to apply the time to
 * @param timezone - IANA timezone (e.g., "Australia/Sydney")
 * @returns UTC Date object
 */
export function timeStringToUtc(timeString: string, date: Date, timezone: string): Date {
  const [hoursRaw, minutesRaw] = timeString.split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);

  const safeHours = Number.isFinite(hours) ? hours : 0;
  const safeMinutes = Number.isFinite(minutes) ? minutes : 0;

  // Derive the local calendar date in the target timezone from the provided instant.
  // Then interpret `${localDate} ${timeString}` as a wall-clock time in that timezone.
  const localDateKey = format(toZonedTime(date, timezone), 'yyyy-MM-dd');
  const hh = String(safeHours).padStart(2, '0');
  const mm = String(safeMinutes).padStart(2, '0');
  return parseInTimezone(`${localDateKey} ${hh}:${mm}`, 'yyyy-MM-dd HH:mm', timezone);
}

/**
 * Convert a UTC Date to a time string in a specific timezone
 * @param date - UTC Date object
 * @param timezone - IANA timezone (e.g., "Australia/Sydney")
 * @returns Time string in HH:mm format
 */
export function utcToTimeString(date: Date, timezone: string): string {
  const zonedDate = toZonedTime(date, timezone);
  return format(zonedDate, 'HH:mm');
}

/**
 * Convert a UTC Date to a specific timezone
 * @param date - UTC Date object
 * @param timezone - IANA timezone
 * @returns Date in the target timezone
 */
export function convertUtcToTimezone(date: Date, timezone: string): Date {
  return toZonedTime(date, timezone);
}

/**
 * Convert a date from one timezone to UTC
 * @param date - Date object
 * @param timezone - Source timezone
 * @returns UTC Date
 */
export function convertTimezoneToUtc(date: Date, timezone: string): Date {
  return fromZonedTime(date, timezone);
}

/**
 * Format a date in a specific timezone
 * @param date - UTC Date object
 * @param timezone - IANA timezone
 * @param formatString - date-fns format string (default: "yyyy-MM-dd HH:mm")
 * @returns Formatted date string
 */
export function formatInTimezone(
  date: Date,
  timezone: string,
  formatString: string = 'yyyy-MM-dd HH:mm'
): string {
  const zonedDate = toZonedTime(date, timezone);
  return format(zonedDate, formatString);
}

/**
 * Get the day of week (0-6, Sunday=0) for a date in a specific timezone
 * @param date - UTC Date object
 * @param timezone - IANA timezone
 * @returns Day of week (0-6)
 */
export function getDayOfWeekInTimezone(date: Date, timezone: string): number {
  const zonedDate = toZonedTime(date, timezone);
  return zonedDate.getDay();
}

/**
 * Parse a date string in a specific timezone to UTC
 * @param dateString - Date string
 * @param formatString - date-fns format string
 * @param timezone - IANA timezone
 * @returns UTC Date object
 */
export function parseInTimezone(dateString: string, formatString: string, timezone: string): Date {
  // Avoid parsing the wall-clock time in the server's timezone (DST-dependent).
  // We only use this helper with ISO-like strings such as "yyyy-MM-dd HH:mm".
  if (formatString !== 'yyyy-MM-dd HH:mm') {
    throw new Error(
      `parseInTimezone only supports formatString "yyyy-MM-dd HH:mm" (got "${formatString}")`
    );
  }

  // date-fns-tz `fromZonedTime` supports parsing ISO-like strings when a timeZone is provided.
  // Example: fromZonedTime("2026-02-05 12:00", "America/New_York") -> UTC instant for that wall time.
  return fromZonedTime(dateString, timezone);
}

/**
 * Get timezone abbreviation (e.g., "EST", "PDT")
 * @param date - Date to get abbreviation for (affects DST)
 * @param timezone - IANA timezone
 * @returns Timezone abbreviation
 */
export function getTimezoneAbbreviation(date: Date, timezone: string): string {
  const zonedDate = toZonedTime(date, timezone);
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'short',
  }).format(zonedDate);

  // Extract the timezone abbreviation from the formatted string
  const match = formatted.match(/\b[A-Z]{3,5}\b/);
  return match?.[0] ?? '';
}

/**
 * Check if a time range overlaps with another time range
 * @param start1 - Start of first range
 * @param end1 - End of first range
 * @param start2 - Start of second range
 * @param end2 - End of second range
 * @returns True if ranges overlap
 */
export function timeRangesOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
  return start1 < end2 && end1 > start2;
}

/**
 * Validate time string format (HH:mm)
 * @param timeString - Time string to validate
 * @returns True if valid
 */
export function isValidTimeString(timeString: string): boolean {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(timeString);
}

/**
 * Validate IANA timezone
 * @param timezone - Timezone to validate
 * @returns True if valid
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

/**
 * Get the UTC offset for a timezone at a specific date
 * @param timezone - IANA timezone
 * @param date - Date to check offset (affects DST)
 * @returns Offset string (e.g., "UTC+10:00", "UTC-05:00")
 */
function getTimezoneOffset(timezone: string, date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'longOffset',
  });

  const parts = formatter.formatToParts(date);
  const offsetPart = parts.find((part) => part.type === 'timeZoneName');

  if (offsetPart?.value && offsetPart.value !== 'GMT') {
    // Convert "GMT+10:00" to "UTC+10:00"
    return offsetPart.value.replace('GMT', 'UTC');
  }

  return 'UTC+00:00';
}

/**
 * Format a timezone name into a readable label
 * @param timezone - IANA timezone (e.g., "America/New_York")
 * @param offset - UTC offset string
 * @returns Formatted label (e.g., "America/New York (UTC-05:00)")
 */
function formatTimezoneLabel(timezone: string, offset: string): string {
  // Replace underscores with spaces for readability
  const readable = timezone.replace(/_/g, ' ');
  return `${readable} (${offset})`;
}

/**
 * Get all available IANA timezones with labels and offsets
 * @returns Array of timezone options sorted by offset and name
 */
export function getAllTimezones(): TimezoneOption[] {
  const timezones = Intl.supportedValuesOf('timeZone');
  const now = new Date();

  const options: TimezoneOption[] = timezones.map((tz) => {
    const offset = getTimezoneOffset(tz, now);
    return {
      value: tz,
      label: formatTimezoneLabel(tz, offset),
      offset,
    };
  });

  // Sort by offset first, then by name
  return options.sort((a, b) => {
    // Extract offset for sorting (e.g., "+10:00" from "UTC+10:00")
    const offsetA = a.offset.replace('UTC', '');
    const offsetB = b.offset.replace('UTC', '');

    if (offsetA !== offsetB) {
      return offsetA.localeCompare(offsetB);
    }

    return a.value.localeCompare(b.value);
  });
}

/**
 * Get a curated list of commonly used timezones
 * @returns Array of common timezone options
 */
export function getCommonTimezones(): TimezoneOption[] {
  const commonTzIds = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Phoenix',
    'America/Los_Angeles',
    'America/Anchorage',
    'Pacific/Honolulu',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
    'Australia/Melbourne',
    'Pacific/Auckland',
  ];

  const now = new Date();

  return commonTzIds.map((tz) => {
    const offset = getTimezoneOffset(tz, now);
    return {
      value: tz,
      label: formatTimezoneLabel(tz, offset),
      offset,
    };
  });
}
