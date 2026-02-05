import { z } from 'zod';
import { isValidTimezone } from '@/lib/utils/timezone';

/**
 * Schema for invitee/guest information (used in booking forms)
 */
export const inviteeInfoSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  notes: z.string().max(1000, 'Notes are too long').optional(),
});

export type InviteeInfoData = z.infer<typeof inviteeInfoSchema>;

/**
 * Schema for getting available slots
 */
export const getAvailableSlotsSchema = z
  .object({
    serviceId: z.string().uuid('Invalid service ID'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    timezone: z
      .string()
      .min(1, 'Timezone is required')
      .refine((tz) => isValidTimezone(tz), 'Invalid IANA timezone'),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be after or equal to start date',
  });

export type GetAvailableSlotsData = z.infer<typeof getAvailableSlotsSchema>;

/**
 * Schema for creating a booking
 */
export const createBookingSchema = z
  .object({
    serviceId: z.string().uuid('Invalid service ID'),
    startTime: z.coerce.date(),
    endTime: z.coerce.date().optional(),
    timezone: z
      .string()
      .min(1, 'Timezone is required')
      .refine((tz) => isValidTimezone(tz), 'Invalid IANA timezone'),
  })
  .merge(inviteeInfoSchema)
  .refine((data) => (data.endTime ? data.endTime > data.startTime : true), {
    message: 'End time must be after start time',
  });

export type CreateBookingData = z.infer<typeof createBookingSchema>;

/**
 * Schema for getting bookings for a service
 */
export const getBookingsForServiceSchema = z.object({
  serviceId: z.string().uuid('Invalid service ID'),
  status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).optional(),
  startAfter: z.coerce.date().optional(),
  startBefore: z.coerce.date().optional(),
});

export type GetBookingsForServiceData = z.infer<typeof getBookingsForServiceSchema>;

/**
 * Schema for getting a single booking
 */
export const getBookingSchema = z.object({
  id: z.string().uuid('Invalid booking ID'),
});

export type GetBookingData = z.infer<typeof getBookingSchema>;

/**
 * Schema for cancelling a booking
 */
export const cancelBookingSchema = z.object({
  id: z.string().uuid('Invalid booking ID'),
});

export type CancelBookingData = z.infer<typeof cancelBookingSchema>;
