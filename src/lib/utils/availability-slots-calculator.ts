import {
  addUtcDays,
  convertUtcToTimezone,
  dateKeyToUtcDate,
  formatInTimezone,
  getDayOfWeekInTimezone,
  parseInTimezone,
  timeRangesOverlap,
  timeStringToMinutes,
  utcDateToDateKey,
} from '@/lib/utils/timezone';
import type { Availability, Booking } from '@prisma/client';
import { addMinutes, differenceInMinutes } from 'date-fns';

export type AvailabilitySlot = {
  startTime: Date;
  endTime: Date;
  teamMemberId?: string; // Optional: which team member is available
};

type BookingParticipantLike = {
  teamMemberId: string | null;
};

type BookingForConflictCheck = Booking & {
  participants?: BookingParticipantLike[];
};

function bookingBlocksTeamMember(booking: BookingForConflictCheck, teamMemberId: string): boolean {
  const participants = booking.participants;
  if (!participants || participants.length === 0) return true;

  const hasAnyTeamMember = participants.some((p) => typeof p.teamMemberId === 'string');
  if (!hasAnyTeamMember) return true; // invitee-only / unassigned bookings block all members

  return participants.some((p) => p.teamMemberId === teamMemberId);
}

/**
 * When service-specific overrides exist for a team member, they should replace
 * (not add to) the default availability for that member.
 */
export function normalizeAvailabilitiesForService(
  availabilities: Availability[],
  serviceId: string
): Availability[] {
  const byMember = new Map<string, { defaults: Availability[]; overrides: Availability[] }>();

  for (const availability of availabilities) {
    const bucket = byMember.get(availability.teamMemberId) ?? { defaults: [], overrides: [] };

    if (availability.serviceId === serviceId) {
      bucket.overrides.push(availability);
    } else if (availability.serviceId === null) {
      bucket.defaults.push(availability);
    }

    byMember.set(availability.teamMemberId, bucket);
  }

  const normalized: Availability[] = [];
  for (const { defaults, overrides } of byMember.values()) {
    normalized.push(...(overrides.length > 0 ? overrides : defaults));
  }

  return normalized;
}

export type CalculateAvailabilityOptions = {
  /**
   * Start of date range to calculate slots for (UTC)
   */
  startDate: Date;

  /**
   * End of date range to calculate slots for (UTC)
   */
  endDate: Date;

  /**
   * Slot duration in minutes
   */
  slotDuration: number;

  /**
   * Buffer time between slots in minutes
   */
  slotBuffer?: number;

  /**
   * Minimum advance booking time in minutes
   * (e.g., 60 = must book at least 1 hour ahead)
   */
  advanceBookingMin?: number;

  /**
   * Maximum advance booking time in minutes
   * (e.g., 43200 = can book up to 30 days ahead)
   */
  advanceBookingMax?: number;

  /**
   * Timezone for the client (for display purposes)
   */
  clientTimezone?: string;
};

/**
 * Calculate available time slots from availability and existing bookings
 *
 * Algorithm:
 * 1. For each day in the date range
 * 2. Find team members with availability for that day of week
 * 3. Convert their availability windows to UTC
 * 4. Generate slots within those windows
 * 5. Filter out slots that overlap with existing bookings
 * 6. Apply advance booking constraints
 */
export function calculateAvailableSlots(
  availabilities: Availability[],
  existingBookings: BookingForConflictCheck[],
  options: CalculateAvailabilityOptions
): AvailabilitySlot[] {
  const {
    startDate,
    endDate,
    slotDuration,
    slotBuffer = 0,
    advanceBookingMin = 0,
    advanceBookingMax = Infinity,
  } = options;

  const now = new Date();
  const earliestBookingTime = addMinutes(now, advanceBookingMin);
  const latestBookingTime =
    advanceBookingMax === Infinity
      ? new Date(8640000000000000)
      : addMinutes(now, advanceBookingMax);

  const slots: AvailabilitySlot[] = [];

  // Group availabilities by team member and day of week
  const availabilityMap = new Map<string, Map<number, Availability[]>>();

  for (const availability of availabilities) {
    if (!availabilityMap.has(availability.teamMemberId)) {
      availabilityMap.set(availability.teamMemberId, new Map());
    }
    const memberMap = availabilityMap.get(availability.teamMemberId)!;

    if (!memberMap.has(availability.dayOfWeek)) {
      memberMap.set(availability.dayOfWeek, []);
    }
    memberMap.get(availability.dayOfWeek)!.push(availability);
  }

  // For each team member with availability, iterate through the date range in THEIR timezone.
  // This prevents off-by-one-day errors when the server runs in UTC and the member is in a negative offset.
  for (const [teamMemberId, memberAvailabilities] of availabilityMap) {
    const firstAvailability = memberAvailabilities.values().next().value?.[0];
    if (!firstAvailability) continue;

    const memberTimezone = firstAvailability.timezone;
    const memberBookings = existingBookings.filter((booking) =>
      bookingBlocksTeamMember(booking, teamMemberId)
    );
    const startLocalKey = formatInTimezone(startDate, memberTimezone, 'yyyy-MM-dd');
    const endLocalKey = formatInTimezone(endDate, memberTimezone, 'yyyy-MM-dd');

    let cursor = dateKeyToUtcDate(startLocalKey);
    const endCursor = dateKeyToUtcDate(endLocalKey);

    while (cursor <= endCursor) {
      const dayKey = utcDateToDateKey(cursor);
      const nextDayKey = utcDateToDateKey(addUtcDays(cursor, 1));

      // Use local noon to avoid DST edge cases around midnight.
      const localNoonUtc = parseInTimezone(`${dayKey} 12:00`, 'yyyy-MM-dd HH:mm', memberTimezone);
      const dayOfWeek = getDayOfWeekInTimezone(localNoonUtc, memberTimezone);

      const dayAvailabilities = memberAvailabilities.get(dayOfWeek) || [];

      for (const availability of dayAvailabilities) {
        const startMinutes = timeStringToMinutes(availability.startTime);
        const endMinutes = timeStringToMinutes(availability.endTime);
        const endDayKey = endMinutes <= startMinutes ? nextDayKey : dayKey;

        const windowStart = parseInTimezone(
          `${dayKey} ${availability.startTime}`,
          'yyyy-MM-dd HH:mm',
          availability.timezone
        );
        const windowEnd = parseInTimezone(
          `${endDayKey} ${availability.endTime}`,
          'yyyy-MM-dd HH:mm',
          availability.timezone
        );

        let slotStart = new Date(windowStart);
        while (slotStart < windowEnd) {
          const slotEnd = addMinutes(slotStart, slotDuration);
          if (slotEnd > windowEnd) break;

          // Enforce requested range explicitly (startDate/endDate are instants in UTC).
          if (slotStart < startDate || slotEnd > endDate) {
            slotStart = addMinutes(slotEnd, slotBuffer);
            continue;
          }

          if (slotStart >= earliestBookingTime && slotStart <= latestBookingTime) {
            const hasConflict = memberBookings.some((booking) =>
              timeRangesOverlap(slotStart, slotEnd, booking.startTime, booking.endTime)
            );

            if (!hasConflict) {
              slots.push({
                startTime: slotStart,
                endTime: slotEnd,
                teamMemberId,
              });
            }
          }

          slotStart = addMinutes(slotEnd, slotBuffer);
        }
      }

      cursor = addUtcDays(cursor, 1);
    }
  }

  // Sort slots by start time
  return slots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

/**
 * Check if a specific time slot is available
 * Used for validation when creating a booking
 */
export function isSlotAvailable(
  availabilities: Availability[],
  existingBookings: BookingForConflictCheck[],
  slotStart: Date,
  slotEnd: Date,
  options?: {
    slotDuration?: number;
    slotBuffer?: number;
  }
): boolean {
  const slotDuration = options?.slotDuration;
  const slotBuffer = options?.slotBuffer ?? 0;

  if (slotDuration !== undefined) {
    const expectedEndTime = addMinutes(slotStart, slotDuration);
    if (slotEnd.getTime() !== expectedEndTime.getTime()) return false;
  }

  for (const availability of availabilities) {
    const slotDayKey = formatInTimezone(slotStart, availability.timezone, 'yyyy-MM-dd');
    const slotDayUtc = dateKeyToUtcDate(slotDayKey);
    const prevSlotDayKey = utcDateToDateKey(addUtcDays(slotDayUtc, -1));

    // Use local noon to avoid DST edge cases around midnight.
    const slotLocalNoonUtc = parseInTimezone(
      `${slotDayKey} 12:00`,
      'yyyy-MM-dd HH:mm',
      availability.timezone
    );
    const slotDayOfWeek = getDayOfWeekInTimezone(slotLocalNoonUtc, availability.timezone);

    const startMinutes = timeStringToMinutes(availability.startTime);
    const endMinutes = timeStringToMinutes(availability.endTime);
    const isOvernight = endMinutes <= startMinutes;

    // Normal windows match the slot's local day-of-week.
    // Overnight windows can also match the *previous* local day-of-week (after-midnight portion).
    let windowStartDayKey: string | null = null;

    if (availability.dayOfWeek === slotDayOfWeek) {
      windowStartDayKey = slotDayKey;
    } else if (isOvernight) {
      const prevLocalNoonUtc = parseInTimezone(
        `${prevSlotDayKey} 12:00`,
        'yyyy-MM-dd HH:mm',
        availability.timezone
      );
      const prevDayOfWeek = getDayOfWeekInTimezone(prevLocalNoonUtc, availability.timezone);
      if (availability.dayOfWeek === prevDayOfWeek) {
        windowStartDayKey = prevSlotDayKey;
      }
    }

    if (!windowStartDayKey) continue;

    const windowEndDayKey = isOvernight
      ? utcDateToDateKey(addUtcDays(dateKeyToUtcDate(windowStartDayKey), 1))
      : windowStartDayKey;

    const windowStart = parseInTimezone(
      `${windowStartDayKey} ${availability.startTime}`,
      'yyyy-MM-dd HH:mm',
      availability.timezone
    );
    const windowEnd = parseInTimezone(
      `${windowEndDayKey} ${availability.endTime}`,
      'yyyy-MM-dd HH:mm',
      availability.timezone
    );

    // Check if slot is within availability window
    if (slotStart >= windowStart && slotEnd <= windowEnd) {
      if (slotDuration !== undefined) {
        const stepMinutes = slotDuration + slotBuffer;
        const deltaMinutes = differenceInMinutes(slotStart, windowStart);
        if (stepMinutes <= 0 || deltaMinutes < 0 || deltaMinutes % stepMinutes !== 0) {
          continue;
        }
      }

      const relevantBookings = existingBookings.filter((booking) =>
        bookingBlocksTeamMember(booking, availability.teamMemberId)
      );

      const hasConflict = relevantBookings.some((booking) =>
        timeRangesOverlap(slotStart, slotEnd, booking.startTime, booking.endTime)
      );

      if (!hasConflict) return true;
    }
  }

  return false;
}

/**
 * Group slots by date for easier rendering
 */
export function groupSlotsByDate(
  slots: AvailabilitySlot[],
  timezone: string
): Map<string, AvailabilitySlot[]> {
  const grouped = new Map<string, AvailabilitySlot[]>();

  for (const slot of slots) {
    // Convert to target timezone and get date string
    const zonedDate = convertUtcToTimezone(slot.startTime, timezone);
    const dateKey = zonedDate.toISOString().split('T')[0] ?? ''; // YYYY-MM-DD

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(slot);
  }

  return grouped;
}
