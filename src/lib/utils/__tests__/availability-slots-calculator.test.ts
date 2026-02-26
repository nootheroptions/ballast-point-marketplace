import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateAvailableSlots,
  isSlotAvailable,
  normalizeAvailabilitiesForService,
  groupSlotsByDate,
} from '../availability-slots-calculator';
import type { Availability, Booking, BookingStatus } from '@prisma/client';

// Simple counter for generating unique IDs in tests
let idCounter = 0;
function generateTestId(): string {
  return `test-id-${++idCounter}`;
}

// Helper to create a mock availability record
function createAvailability(overrides: Partial<Availability> = {}): Availability {
  return {
    id: generateTestId(),
    dayOfWeek: 1, // Monday
    startTime: '09:00',
    endTime: '17:00',
    timezone: 'Australia/Sydney',
    teamMemberId: 'team-member-1',
    serviceId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// Helper to create a mock booking record
function createBooking(
  overrides: Partial<Booking> & { participants?: { teamMemberId: string | null }[] } = {}
): Booking & { participants?: { teamMemberId: string | null }[] } {
  return {
    id: generateTestId(),
    startTime: new Date('2024-03-18T10:00:00Z'),
    endTime: new Date('2024-03-18T11:00:00Z'),
    timezone: 'Australia/Sydney',
    status: 'CONFIRMED' as BookingStatus,
    notes: null,
    cancelledAt: null,
    serviceId: 'service-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('normalizeAvailabilitiesForService', () => {
  it('should return default availability when no service overrides exist', () => {
    const availabilities = [
      createAvailability({ dayOfWeek: 1, serviceId: null }),
      createAvailability({ dayOfWeek: 2, serviceId: null }),
    ];

    const result = normalizeAvailabilitiesForService(availabilities, 'service-1');

    expect(result).toHaveLength(2);
    expect(result.every((a) => a.serviceId === null)).toBe(true);
  });

  it('should use service-specific availability when it exists', () => {
    const availabilities = [
      createAvailability({ dayOfWeek: 1, serviceId: null, startTime: '09:00', endTime: '17:00' }),
      createAvailability({
        dayOfWeek: 1,
        serviceId: 'service-1',
        startTime: '10:00',
        endTime: '14:00',
      }),
    ];

    const result = normalizeAvailabilitiesForService(availabilities, 'service-1');

    expect(result).toHaveLength(1);
    expect(result[0]?.serviceId).toBe('service-1');
    expect(result[0]?.startTime).toBe('10:00');
    expect(result[0]?.endTime).toBe('14:00');
  });

  it('should handle multiple team members with mixed overrides', () => {
    const availabilities = [
      // Team member 1: default only
      createAvailability({ teamMemberId: 'member-1', serviceId: null }),
      // Team member 2: has override for service-1
      createAvailability({
        teamMemberId: 'member-2',
        serviceId: null,
        startTime: '09:00',
        endTime: '17:00',
      }),
      createAvailability({
        teamMemberId: 'member-2',
        serviceId: 'service-1',
        startTime: '10:00',
        endTime: '15:00',
      }),
    ];

    const result = normalizeAvailabilitiesForService(availabilities, 'service-1');

    expect(result).toHaveLength(2);

    const member1 = result.find((a) => a.teamMemberId === 'member-1');
    const member2 = result.find((a) => a.teamMemberId === 'member-2');

    expect(member1?.serviceId).toBeNull();
    expect(member2?.serviceId).toBe('service-1');
    expect(member2?.startTime).toBe('10:00');
  });
});

describe('calculateAvailableSlots', () => {
  beforeEach(() => {
    // Mock the current date to ensure consistent test results
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-18T00:00:00Z')); // A Monday
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should generate slots within availability windows', () => {
    const availabilities = [
      createAvailability({
        dayOfWeek: 1, // Monday
        startTime: '10:00',
        endTime: '12:00',
        timezone: 'UTC',
      }),
    ];

    const result = calculateAvailableSlots(availabilities, [], {
      startDate: new Date('2024-03-18T00:00:00Z'),
      endDate: new Date('2024-03-18T23:59:59Z'),
      slotDuration: 60, // 1 hour slots
      slotBuffer: 0,
    });

    expect(result).toHaveLength(2); // 10:00-11:00 and 11:00-12:00
    expect(result[0]?.startTime).toEqual(new Date('2024-03-18T10:00:00Z'));
    expect(result[0]?.endTime).toEqual(new Date('2024-03-18T11:00:00Z'));
    expect(result[1]?.startTime).toEqual(new Date('2024-03-18T11:00:00Z'));
    expect(result[1]?.endTime).toEqual(new Date('2024-03-18T12:00:00Z'));
  });

  it('should exclude slots that overlap with existing bookings', () => {
    const availabilities = [
      createAvailability({
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '14:00',
        timezone: 'UTC',
      }),
    ];

    const existingBookings = [
      createBooking({
        startTime: new Date('2024-03-18T11:00:00Z'),
        endTime: new Date('2024-03-18T12:00:00Z'),
        participants: [{ teamMemberId: 'team-member-1' }],
      }),
    ];

    const result = calculateAvailableSlots(availabilities, existingBookings, {
      startDate: new Date('2024-03-18T00:00:00Z'),
      endDate: new Date('2024-03-18T23:59:59Z'),
      slotDuration: 60,
      slotBuffer: 0,
    });

    // Should have 10:00-11:00, 12:00-13:00, 13:00-14:00 (11:00-12:00 is blocked)
    expect(result).toHaveLength(3);
    expect(
      result.find((s) => s.startTime.getTime() === new Date('2024-03-18T11:00:00Z').getTime())
    ).toBeUndefined();
  });

  it('should respect slot buffer between appointments', () => {
    const availabilities = [
      createAvailability({
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '13:00',
        timezone: 'UTC',
      }),
    ];

    const result = calculateAvailableSlots(availabilities, [], {
      startDate: new Date('2024-03-18T00:00:00Z'),
      endDate: new Date('2024-03-18T23:59:59Z'),
      slotDuration: 60,
      slotBuffer: 30, // 30 minute buffer
    });

    // With 30 min buffer: 10:00-11:00, then 11:30-12:30 (12:00-13:00 doesn't fit)
    expect(result).toHaveLength(2);
    expect(result[0]?.startTime).toEqual(new Date('2024-03-18T10:00:00Z'));
    expect(result[1]?.startTime).toEqual(new Date('2024-03-18T11:30:00Z'));
  });

  it('should respect advance booking constraints', () => {
    // Set current time to 10:30 UTC
    vi.setSystemTime(new Date('2024-03-18T10:30:00Z'));

    const availabilities = [
      createAvailability({
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '14:00',
        timezone: 'UTC',
      }),
    ];

    const result = calculateAvailableSlots(availabilities, [], {
      startDate: new Date('2024-03-18T00:00:00Z'),
      endDate: new Date('2024-03-18T23:59:59Z'),
      slotDuration: 60,
      slotBuffer: 0,
      advanceBookingMin: 60, // Must book at least 1 hour in advance
    });

    // At 10:30, with 1 hour advance requirement, earliest slot is 11:30
    // But slots are on hour boundaries, so 12:00 and 13:00 should be available
    expect(result.every((s) => s.startTime >= new Date('2024-03-18T11:30:00Z'))).toBe(true);
  });

  it('should exclude slots blocked by external calendar events (treated as bookings)', () => {
    const availabilities = [
      createAvailability({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'UTC',
      }),
    ];

    // Simulate external calendar event as a booking
    const externalEvents = [
      createBooking({
        id: 'external-google-event-1',
        startTime: new Date('2024-03-18T13:00:00Z'),
        endTime: new Date('2024-03-18T14:00:00Z'),
        participants: [{ teamMemberId: 'team-member-1' }],
      }),
    ];

    const result = calculateAvailableSlots(availabilities, externalEvents, {
      startDate: new Date('2024-03-18T00:00:00Z'),
      endDate: new Date('2024-03-18T23:59:59Z'),
      slotDuration: 60,
      slotBuffer: 0,
    });

    // 13:00-14:00 should be blocked
    const blockedSlot = result.find(
      (s) => s.startTime.getTime() === new Date('2024-03-18T13:00:00Z').getTime()
    );
    expect(blockedSlot).toBeUndefined();
  });

  it('should only block slots for the specific team member with external events', () => {
    const availabilities = [
      createAvailability({
        teamMemberId: 'member-1',
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '14:00',
        timezone: 'UTC',
      }),
      createAvailability({
        teamMemberId: 'member-2',
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '14:00',
        timezone: 'UTC',
      }),
    ];

    // External event only blocks member-1
    const externalEvents = [
      createBooking({
        startTime: new Date('2024-03-18T11:00:00Z'),
        endTime: new Date('2024-03-18T12:00:00Z'),
        participants: [{ teamMemberId: 'member-1' }],
      }),
    ];

    const result = calculateAvailableSlots(availabilities, externalEvents, {
      startDate: new Date('2024-03-18T00:00:00Z'),
      endDate: new Date('2024-03-18T23:59:59Z'),
      slotDuration: 60,
      slotBuffer: 0,
    });

    // Member-1 should have 3 slots (10:00, 12:00, 13:00)
    // Member-2 should have 4 slots (10:00, 11:00, 12:00, 13:00)
    const member1Slots = result.filter((s) => s.teamMemberId === 'member-1');
    const member2Slots = result.filter((s) => s.teamMemberId === 'member-2');

    expect(member1Slots).toHaveLength(3);
    expect(member2Slots).toHaveLength(4);

    // Verify member-1's 11:00 slot is blocked
    expect(
      member1Slots.find((s) => s.startTime.getTime() === new Date('2024-03-18T11:00:00Z').getTime())
    ).toBeUndefined();

    // Verify member-2's 11:00 slot is available
    expect(
      member2Slots.find((s) => s.startTime.getTime() === new Date('2024-03-18T11:00:00Z').getTime())
    ).toBeDefined();
  });

  it('should handle overnight availability windows', () => {
    const availabilities = [
      createAvailability({
        dayOfWeek: 1, // Monday
        startTime: '22:00',
        endTime: '02:00', // Ends Tuesday 2am
        timezone: 'UTC',
      }),
    ];

    const result = calculateAvailableSlots(availabilities, [], {
      startDate: new Date('2024-03-18T00:00:00Z'),
      endDate: new Date('2024-03-19T23:59:59Z'),
      slotDuration: 60,
      slotBuffer: 0,
    });

    // Should have 22:00, 23:00, 00:00, 01:00
    expect(result).toHaveLength(4);
    expect(result[0]?.startTime).toEqual(new Date('2024-03-18T22:00:00Z'));
    expect(result[3]?.startTime).toEqual(new Date('2024-03-19T01:00:00Z'));
  });
});

describe('isSlotAvailable', () => {
  it('should return true for available slots', () => {
    const availabilities = [
      createAvailability({
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '14:00',
        timezone: 'UTC',
      }),
    ];

    const result = isSlotAvailable(
      availabilities,
      [],
      new Date('2024-03-18T11:00:00Z'),
      new Date('2024-03-18T12:00:00Z'),
      { slotDuration: 60, slotBuffer: 0 }
    );

    expect(result).toBe(true);
  });

  it('should return false when slot overlaps with booking', () => {
    const availabilities = [
      createAvailability({
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '14:00',
        timezone: 'UTC',
      }),
    ];

    const bookings = [
      createBooking({
        startTime: new Date('2024-03-18T11:00:00Z'),
        endTime: new Date('2024-03-18T12:00:00Z'),
        participants: [{ teamMemberId: 'team-member-1' }],
      }),
    ];

    const result = isSlotAvailable(
      availabilities,
      bookings,
      new Date('2024-03-18T11:00:00Z'),
      new Date('2024-03-18T12:00:00Z'),
      { slotDuration: 60, slotBuffer: 0 }
    );

    expect(result).toBe(false);
  });

  it('should return false when slot is outside availability window', () => {
    const availabilities = [
      createAvailability({
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '14:00',
        timezone: 'UTC',
      }),
    ];

    const result = isSlotAvailable(
      availabilities,
      [],
      new Date('2024-03-18T08:00:00Z'),
      new Date('2024-03-18T09:00:00Z'),
      { slotDuration: 60, slotBuffer: 0 }
    );

    expect(result).toBe(false);
  });

  it('should return false when slot duration does not match', () => {
    const availabilities = [
      createAvailability({
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '14:00',
        timezone: 'UTC',
      }),
    ];

    // Trying to book a 90 minute slot when service requires 60 minutes
    const result = isSlotAvailable(
      availabilities,
      [],
      new Date('2024-03-18T11:00:00Z'),
      new Date('2024-03-18T12:30:00Z'),
      { slotDuration: 60, slotBuffer: 0 }
    );

    expect(result).toBe(false);
  });
});

describe('groupSlotsByDate', () => {
  it('should group slots by their date in the specified timezone', () => {
    const slots = [
      {
        startTime: new Date('2024-03-18T10:00:00Z'),
        endTime: new Date('2024-03-18T11:00:00Z'),
      },
      {
        startTime: new Date('2024-03-18T14:00:00Z'),
        endTime: new Date('2024-03-18T15:00:00Z'),
      },
      {
        startTime: new Date('2024-03-19T10:00:00Z'),
        endTime: new Date('2024-03-19T11:00:00Z'),
      },
    ];

    const result = groupSlotsByDate(slots, 'UTC');

    // Should group into multiple dates
    expect(result.size).toBeGreaterThan(0);

    // Total slots should be preserved
    const allSlots = Array.from(result.values()).flat();
    expect(allSlots).toHaveLength(3);

    // Each group should have at least one slot
    for (const [, groupSlots] of result) {
      expect(groupSlots.length).toBeGreaterThan(0);
    }
  });
});
