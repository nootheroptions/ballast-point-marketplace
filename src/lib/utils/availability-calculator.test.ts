import type { Availability, Booking } from '@prisma/client';
import { fromZonedTime } from 'date-fns-tz';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  calculateAvailableSlots,
  isSlotAvailable,
  normalizeAvailabilitiesForService,
} from './availability-slots-calculator';

type BookingForTest = Booking & { participants?: { teamMemberId: string | null }[] };

function zonedWallTimeToUtc(dateKey: string, timeHHmm: string, timezone: string): Date {
  return fromZonedTime(`${dateKey} ${timeHHmm}`, timezone);
}

function createAvailability(
  partial: Partial<Availability> &
    Pick<Availability, 'teamMemberId' | 'dayOfWeek' | 'startTime' | 'endTime' | 'timezone'>
): Availability {
  return {
    id: partial.id ?? '00000000-0000-0000-0000-000000000001',
    teamMemberId: partial.teamMemberId,
    dayOfWeek: partial.dayOfWeek,
    startTime: partial.startTime,
    endTime: partial.endTime,
    timezone: partial.timezone,
    serviceId: partial.serviceId ?? null,
    createdAt: partial.createdAt ?? new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: partial.updatedAt ?? new Date('2026-01-01T00:00:00.000Z'),
  };
}

function createBooking(
  partial: Partial<Booking> &
    Pick<Booking, 'serviceId' | 'startTime' | 'endTime' | 'timezone' | 'status'>
): BookingForTest {
  return {
    id: partial.id ?? '00000000-0000-0000-0000-0000000000b1',
    serviceId: partial.serviceId,
    startTime: partial.startTime,
    endTime: partial.endTime,
    timezone: partial.timezone,
    status: partial.status,
    notes: partial.notes ?? null,
    cancelledAt: partial.cancelledAt ?? null,
    createdAt: partial.createdAt ?? new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: partial.updatedAt ?? new Date('2026-01-01T00:00:00.000Z'),
    ...((partial as BookingForTest).participants
      ? { participants: (partial as BookingForTest).participants }
      : {}),
  };
}

describe('normalizeAvailabilitiesForService', () => {
  it('prefers service overrides over default availability per team member', () => {
    const serviceId = '00000000-0000-0000-0000-0000000000s1';

    const availabilities: Availability[] = [
      createAvailability({
        teamMemberId: '00000000-0000-0000-0000-0000000000m1',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'UTC',
        serviceId: null,
      }),
      createAvailability({
        teamMemberId: '00000000-0000-0000-0000-0000000000m1',
        dayOfWeek: 1,
        startTime: '13:00',
        endTime: '14:00',
        timezone: 'UTC',
        serviceId,
      }),
      createAvailability({
        teamMemberId: '00000000-0000-0000-0000-0000000000m2',
        dayOfWeek: 2,
        startTime: '10:00',
        endTime: '11:00',
        timezone: 'UTC',
        serviceId: null,
      }),
    ];

    const normalized = normalizeAvailabilitiesForService(availabilities, serviceId);

    expect(
      normalized.map(
        (a) => `${a.teamMemberId}:${a.serviceId ?? 'default'}:${a.startTime}-${a.endTime}`
      )
    ).toEqual([
      // member1 uses override only
      `00000000-0000-0000-0000-0000000000m1:${serviceId}:13:00-14:00`,
      // member2 uses defaults (no override)
      `00000000-0000-0000-0000-0000000000m2:default:10:00-11:00`,
    ]);
  });
});

describe('calculateAvailableSlots (timezone correctness)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('generates slots for the correct local weekday in negative-offset timezones', () => {
    // Feb 5, 2026 is Thursday.
    const tz = 'America/Los_Angeles';

    const slots = calculateAvailableSlots(
      [
        createAvailability({
          teamMemberId: '00000000-0000-0000-0000-0000000000m1',
          dayOfWeek: 4, // Thursday
          startTime: '09:00',
          endTime: '10:00',
          timezone: tz,
        }),
      ],
      [],
      {
        startDate: new Date('2026-02-05T00:00:00.000Z'),
        endDate: new Date('2026-02-06T23:59:59.000Z'),
        slotDuration: 60,
        slotBuffer: 0,
        advanceBookingMin: 0,
      }
    );

    const expectedStart = zonedWallTimeToUtc('2026-02-05', '09:00', tz).toISOString();
    expect(slots.map((s) => s.startTime.toISOString())).toEqual([expectedStart]);
  });

  it('respects slotDuration and slotBuffer within a window', () => {
    const tz = 'America/New_York';

    const slots = calculateAvailableSlots(
      [
        createAvailability({
          teamMemberId: '00000000-0000-0000-0000-0000000000m1',
          dayOfWeek: 4, // Thursday
          startTime: '09:00',
          endTime: '12:00',
          timezone: tz,
        }),
      ],
      [],
      {
        startDate: new Date('2026-02-05T00:00:00.000Z'),
        endDate: new Date('2026-02-05T23:59:59.000Z'),
        slotDuration: 60,
        slotBuffer: 15,
        advanceBookingMin: 0,
      }
    );

    const expected = [
      zonedWallTimeToUtc('2026-02-05', '09:00', tz).toISOString(),
      zonedWallTimeToUtc('2026-02-05', '10:15', tz).toISOString(),
    ];

    expect(slots.map((s) => s.startTime.toISOString())).toEqual(expected);
  });

  it('supports overnight availability windows that cross midnight', () => {
    const tz = 'UTC';

    const slots = calculateAvailableSlots(
      [
        createAvailability({
          teamMemberId: '00000000-0000-0000-0000-0000000000m1',
          dayOfWeek: 5, // Friday
          startTime: '22:00',
          endTime: '02:00',
          timezone: tz,
        }),
      ],
      [],
      {
        startDate: new Date('2026-02-06T00:00:00.000Z'),
        endDate: new Date('2026-02-07T23:59:59.000Z'),
        slotDuration: 60,
        slotBuffer: 0,
        advanceBookingMin: 0,
      }
    );

    const expected = [
      '2026-02-06T22:00:00.000Z',
      '2026-02-06T23:00:00.000Z',
      '2026-02-07T00:00:00.000Z',
      '2026-02-07T01:00:00.000Z',
    ];

    expect(slots.map((s) => s.startTime.toISOString())).toEqual(expected);
  });

  it('excludes slots that overlap existing bookings', () => {
    const tz = 'UTC';
    const serviceId = '00000000-0000-0000-0000-0000000000s1';

    const availability: Availability[] = [
      createAvailability({
        teamMemberId: '00000000-0000-0000-0000-0000000000m1',
        dayOfWeek: 4, // Thursday
        startTime: '09:00',
        endTime: '12:00',
        timezone: tz,
      }),
    ];

    const bookings: Booking[] = [
      createBooking({
        serviceId,
        status: 'CONFIRMED',
        timezone: tz,
        startTime: new Date('2026-02-05T10:00:00.000Z'),
        endTime: new Date('2026-02-05T11:00:00.000Z'),
      }),
    ];

    const slots = calculateAvailableSlots(availability, bookings, {
      startDate: new Date('2026-02-05T00:00:00.000Z'),
      endDate: new Date('2026-02-05T23:59:59.000Z'),
      slotDuration: 60,
      slotBuffer: 0,
      advanceBookingMin: 0,
    });

    expect(slots.map((s) => s.startTime.toISOString())).toEqual([
      '2026-02-05T09:00:00.000Z',
      '2026-02-05T11:00:00.000Z',
    ]);
  });

  it('scopes booking overlap checks to the relevant team member', () => {
    const tz = 'UTC';
    const serviceId = '00000000-0000-0000-0000-0000000000s1';

    const availability: Availability[] = [
      createAvailability({
        teamMemberId: '00000000-0000-0000-0000-0000000000m1',
        dayOfWeek: 4, // Thursday
        startTime: '09:00',
        endTime: '12:00',
        timezone: tz,
      }),
      createAvailability({
        teamMemberId: '00000000-0000-0000-0000-0000000000m2',
        dayOfWeek: 4, // Thursday
        startTime: '09:00',
        endTime: '12:00',
        timezone: tz,
      }),
    ];

    const bookings: BookingForTest[] = [
      createBooking({
        serviceId,
        status: 'CONFIRMED',
        timezone: tz,
        startTime: new Date('2026-02-05T10:00:00.000Z'),
        endTime: new Date('2026-02-05T11:00:00.000Z'),
        participants: [{ teamMemberId: '00000000-0000-0000-0000-0000000000m1' }],
      } as BookingForTest),
    ];

    const slots = calculateAvailableSlots(availability, bookings, {
      startDate: new Date('2026-02-05T00:00:00.000Z'),
      endDate: new Date('2026-02-05T23:59:59.000Z'),
      slotDuration: 60,
      slotBuffer: 0,
      advanceBookingMin: 0,
    });

    const m1Slots = slots
      .filter((s) => s.teamMemberId === '00000000-0000-0000-0000-0000000000m1')
      .map((s) => s.startTime.toISOString());
    const m2Slots = slots
      .filter((s) => s.teamMemberId === '00000000-0000-0000-0000-0000000000m2')
      .map((s) => s.startTime.toISOString());

    expect(m1Slots).toEqual(['2026-02-05T09:00:00.000Z', '2026-02-05T11:00:00.000Z']);
    expect(m2Slots).toEqual([
      '2026-02-05T09:00:00.000Z',
      '2026-02-05T10:00:00.000Z',
      '2026-02-05T11:00:00.000Z',
    ]);
  });

  it('sorts slots by UTC start time across multiple team members/timezones', () => {
    const ny = 'America/New_York';
    const la = 'America/Los_Angeles';

    const slots = calculateAvailableSlots(
      [
        createAvailability({
          teamMemberId: '00000000-0000-0000-0000-0000000000m1',
          dayOfWeek: 4,
          startTime: '09:00',
          endTime: '10:00',
          timezone: la,
        }),
        createAvailability({
          teamMemberId: '00000000-0000-0000-0000-0000000000m2',
          dayOfWeek: 4,
          startTime: '09:00',
          endTime: '10:00',
          timezone: ny,
        }),
      ],
      [],
      {
        startDate: new Date('2026-02-05T00:00:00.000Z'),
        endDate: new Date('2026-02-05T23:59:59.000Z'),
        slotDuration: 60,
        slotBuffer: 0,
        advanceBookingMin: 0,
      }
    );

    const expectedNy = zonedWallTimeToUtc('2026-02-05', '09:00', ny).toISOString();
    const expectedLa = zonedWallTimeToUtc('2026-02-05', '09:00', la).toISOString();

    expect(slots.map((s) => s.startTime.toISOString())).toEqual([expectedNy, expectedLa]);
  });
});

describe('isSlotAvailable (overnight windows)', () => {
  it('accepts slots after midnight for an overnight availability row', () => {
    const tz = 'UTC';

    const availability: Availability[] = [
      createAvailability({
        teamMemberId: '00000000-0000-0000-0000-0000000000m1',
        dayOfWeek: 5, // Friday
        startTime: '22:00',
        endTime: '02:00',
        timezone: tz,
      }),
    ];

    const slotStart = new Date('2026-02-07T01:00:00.000Z'); // Saturday 01:00 UTC
    const slotEnd = new Date('2026-02-07T02:00:00.000Z');

    expect(
      isSlotAvailable(availability, [], slotStart, slotEnd, { slotDuration: 60, slotBuffer: 0 })
    ).toBe(true);

    // Outside window
    const badStart = new Date('2026-02-07T03:00:00.000Z');
    const badEnd = new Date('2026-02-07T04:00:00.000Z');
    expect(
      isSlotAvailable(availability, [], badStart, badEnd, { slotDuration: 60, slotBuffer: 0 })
    ).toBe(false);
  });
});
